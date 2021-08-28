import {DeviceSourceManager, DeviceType} from "babylonjs";
import {SystemDescription, SystemInstance} from "../system";
import {EngineSystem, EngineSystemImpl} from "../engine/engine.system";
import {EventState} from "babylonjs/Misc/observable";
import {IDeviceEvent} from "babylonjs/DeviceInput/Interfaces/inputInterfaces";
import {InputAlias, InputAliasPipe} from "./alias";
import {InputListener} from "./triggers";

export type InputHandlerFunction = (inputState: InputState) => void;

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
}

export type InputStateCache = Partial<Record<DeviceType, Record<number, InputState>>>;

export class InputSystemConfig {
    inputAliasConfig?: InputAlias[] = undefined
}

/**
 * Input users should rely on aliases for buttons and not on actual inputs
 *
 * Aliases can have different possible input types (press, double, on hold (with time held), on release)
 *
 * @example
 * Rotate Camera - Hold RMB
 * Drag and Drop - Hold LMB
 * Move - Double-press LMB
 * Choose gun 1 - Press 1
 * Use shield boost - Press H
 * 
 * Keys can be combined
 */
export class InputSystemImpl extends SystemInstance<InputSystemImpl, InputSystemConfig> {

    lastTickTime: number = 0;

    inputStateCache: InputStateCache = {};
    triggerCache: Map<InputListener, any> = new Map<InputListener, any>();

    aliasHandlers: Map<InputAlias, InputHandlerFunction[]> = new Map<InputAlias, InputHandlerFunction[]>();

    deviceSourceManager!: DeviceSourceManager;

    engineSystem!: EngineSystemImpl;

    protected async initialize() {
        this.engineSystem = this.provider.getInjectedSystem(EngineSystem);

        this.deviceSourceManager = new DeviceSourceManager(this.engineSystem.getEngine());

        this.deviceSourceManager.onDeviceConnectedObservable.add(device => {
            device.onInputChangedObservable.add(this.updateInputCache.bind(this));
        })

        this.engineSystem.registerBeforeRenderHook(this.tickInput.bind(this));
    }

    tickInput() {
        const startTimestamp = Date.now();

        this.triggerAliases();
        const endTimestamp = Date.now();
        this.lastTickTime = endTimestamp - startTimestamp;
    }

    getTickTime(): string {
        return this.lastTickTime + '';
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

    protected updateInputCache(event: IDeviceEvent, eventState: EventState) {
        const currentInput = this.inputStateCache[event.deviceType]?.[event.inputIndex];

        if (currentInput && event.currentState === currentInput.value) {
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
     * Triggers should return numeric value instead of boolean
     *
     * @protected
     */
    protected triggerAliases() {
        this.aliasHandlers.forEach((handlers, alias) => {
            const inputState = alias.bindings.reduce(
                (acc: InputState | undefined, listener) => {
                    return listener.getInputState(this.inputStateCache) ?? acc;
                },
                undefined
            );

            if (inputState) {
                handlers?.forEach(handler => handler(inputState))
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