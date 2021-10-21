import {DeviceSourceManager, DeviceType, PerfCounter, PointerInput} from "babylonjs";
import {SystemDescription, SystemInstance} from "../system";
import {EngineSystem, EngineSystemImpl} from "../engine/engine.system";
import {EventState} from "babylonjs/Misc/observable";
import {IDeviceEvent} from "babylonjs/DeviceInput/Interfaces/inputInterfaces";
import {InputAlias, InputAliasPipe} from "./alias";
import {InputListener} from "./triggers";
import {getClassName} from "../../shared/functions/get-class-name";
import {AbstractInputEventTranslator} from "./translator/translator";
import {MouseTranslator} from "./translator/mouse.translator";

export type InputHandlerFunction = (inputState: InputState) => void;

/**
 * Object that represents current input state for some action
 */
export type InputState = {

    /**
     * Time when input was triggered with this value for first time
     */
    timestamp: number,

    /**
     * Value which is held
     */
    value: number,

    /**
     * How long input remained the same
     */
    activeTotally: number

    /**
     * How long input was held since last activation
     */
    heldSinceLastActivation: number

    /**
     * Time passed since last activation
     */
    delta: number,

    /**
     * Previous time for activations faster that one frame
     */
    lastTimeActivated: number,

    /**
     * Previous value for activations faster that one frame
     */
    lastTimeActivatedValue: number,
}

/**
 * Object that holds last input states for all once activated keys of connected devices
 */
export type InputStateCache = Partial<Record<DeviceType, Record<number, InputState>>>;

export class InputSystemConfig {
    inputAliasConfig?: InputAlias[] = undefined
}

/**
 * System that allows to create input aliases and listen to them
 */
export class InputSystemImpl extends SystemInstance<InputSystemImpl, InputSystemConfig> {

    inputTickCounter = new PerfCounter();

    inputStateCache: InputStateCache = {};
    triggerCache: Map<InputListener, any> = new Map<InputListener, any>();

    aliasHandlers: Map<InputAlias, InputHandlerFunction[]> = new Map<InputAlias, InputHandlerFunction[]>();

    deviceSourceManager!: DeviceSourceManager;

    engineSystem!: EngineSystemImpl;

    translators: Record<string, AbstractInputEventTranslator> = {};

    protected async initialize() {
        this.engineSystem = this.provider.getSystem(EngineSystem);

        this.attachEventTranslator(new MouseTranslator());

        this.deviceSourceManager = new DeviceSourceManager(this.engineSystem.getEngine());

        this.deviceSourceManager.onDeviceConnectedObservable.add(device => {
            device.onInputChangedObservable.add(event => {
                // Pass events through translator if exists
                const eventsToHandle = this.translators[event.deviceType]?.translate(event) ?? [ event ];

                eventsToHandle.forEach(event => this.updateInputCacheWithEvent.bind(this)(event));
            });
        });

        this.engineSystem.registerBeforeRenderHook(this.tickInput.bind(this));
    }

    getTickTime(): string {
        return this.inputTickCounter.lastSecAverage + '';
    }

    /**
     * Add function that is called for given device source (if connected) each frame
     * @param alias Alias to listen
     * @param listener Listener function
     */
    addAliasListener(alias: InputAlias, listener: InputHandlerFunction) {
        this.aliasHandlers.set(alias, [
            ...(this.aliasHandlers.get(alias) ?? []),
            listener
        ])
    }

    /**
     * @param alias Alias to listen to
     * @param filterFunction Tells if input should be reacted
     * @param additionalDataFunction Function that can prepare and provide additional data for handler
     * @param inputHandlerFunction Function that is called to handle event
     * @param initialCache Cache object with initial values
     */
    createAliasPipe<EventDataType extends {}, CacheType extends {}>(
        alias: InputAlias,
        filterFunction: InputAliasPipe<EventDataType, CacheType>['filterFunction'],
        additionalDataFunction: InputAliasPipe<EventDataType, CacheType>['additionalDataFunction'],
        inputHandlerFunction: InputAliasPipe<EventDataType, CacheType>['inputHandlerFunction'],
        initialCache: CacheType,
    ) {
        return new InputAliasPipe(
            this,
            alias,
            filterFunction,
            additionalDataFunction,
            inputHandlerFunction,
            initialCache
        );
    }


    /**
     * Ticks input system
     * @protected
     */
    protected tickInput() {
        this.inputTickCounter.beginMonitoring();

        this.checkAliases();

        this.inputTickCounter.endMonitoring();
    }

    protected attachEventTranslator(translator: AbstractInputEventTranslator) {
        this.translators[translator.deviceType()] = translator;
    }

    /**
     * Updates cache using given event
     * @param event
     * @protected
     */
    protected updateInputCacheWithEvent(event: IDeviceEvent) {
        const currentInput = this.inputStateCache[event.deviceType]?.[event.inputIndex];


        if (currentInput && event.currentState === currentInput.value) {

            event.inputIndex === PointerInput.LeftClick && console.log(event);
            event.inputIndex === PointerInput.MouseWheelY && console.log(event);

            const timestamp = Date.now();
            currentInput.heldSinceLastActivation = timestamp - currentInput.timestamp;
            currentInput.activeTotally = currentInput.activeTotally + currentInput.heldSinceLastActivation;
        }
        else {

            const timestamp = Date.now();
            const newInput: InputState = {
                value: event.currentState as number,
                timestamp: timestamp,
                activeTotally: 0,
                heldSinceLastActivation: 0,
                delta: timestamp - (currentInput?.timestamp ?? 0),
                lastTimeActivated: (event.currentState != 0) ? timestamp : currentInput?.lastTimeActivated ?? 0,
                lastTimeActivatedValue: (event.currentState && event.currentState !== 0) ? event.currentState : currentInput?.lastTimeActivatedValue ?? 0
            };

            this.inputStateCache = {
                ...this.inputStateCache,
                [event.deviceType]: {
                    ...(this.inputStateCache[event.deviceType] ?? {}),
                    [event.inputIndex]: newInput
                }
            }
        }
    }

    /**
     * Runs check for all registered aliases
     * @protected
     */
    protected checkAliases() {
        this.aliasHandlers.forEach((handlers, alias) => {
            const inputState = alias.bindings.reduce(
                (acc: InputState | undefined, listener) => {
                    return listener.getInputState(this.inputStateCache, { loggingEnabled: alias.options?.loggingEnabled }) ?? acc;
                },
                undefined
            );

            if (inputState) {
                (this.provider.options.loggingEnabled || alias.options?.loggingEnabled) && console.log(`[${getClassName(this)}]: Alias [${alias.name}] triggered, calling handlers. Input state:\n`, inputState);

                handlers?.forEach(handler => handler(inputState))
            } else {
                (this.provider.options.loggingEnabled || alias.options?.loggingEnabled) && console.log(`[${getClassName(this)}]: Alias [${alias.name}] not triggered`);
            }
        });
    }
}

export const InputSystem = new SystemDescription(
    InputSystemConfig,
    InputSystemImpl,
    [
        EngineSystem,
    ]
);