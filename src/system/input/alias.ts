import {InputListener, InputTriggerTypes} from "./triggers";
import {InputState, InputSystemImpl} from "./input.system";
import {DeepImmutable} from "babylonjs/types";

/**
 * Object that configures some input action
 *
 * Idea is that input users should rely on aliases for buttons and not on actual inputs
 * Aliases can have different possible input types (press, double, on hold (with time held), on release)
 *
 * @example
 * Rotate Camera - Hold RMB
 * Drag and Drop - Hold LMB
 * Move - Double-press LMB
 * Choose gun 1 - Press 1
 * Use shield boost - Press H
 *
 * @internal Should stay serializable
 */
export class InputAlias {

    /**
     * Gives current alias bindings
     *
     * If custom bindings are set, they override default ones
     */
    get bindings() {
        return this.options?.customBindings ?? this.defaultBindings;
    }

    constructor(
        readonly name: string,
        readonly allowedTriggerTypes: InputTriggerTypes[],
        readonly defaultBindings: InputListener[],
        readonly options?: DeepImmutable<{
            loggingEnabled?: boolean,
            customBindings?: InputListener[]
        }>
    ) {}
}

/**
 * Used to react to alias with additional conditions
 */
export class InputAliasPipe<EventDataType extends {}, CacheType extends {}> {

    protected _enabled = true;

    constructor(
        protected inputSystem: InputSystemImpl,
        protected alias: InputAlias,

        /**
         * Tells if input should be reacted
         */
        protected filterFunction: (inputState: InputState, cache: CacheType) => boolean,

        /**
         * Returns value then will be given to handler function
         */
        protected additionalDataFunction: () => EventDataType,

        /**
         * Function that is called to handle event
         */
        protected inputHandlerFunction: (inputState: InputState, data: EventDataType, cache: CacheType) => void,

        protected initialCache: CacheType,
    ) {
        inputSystem.addAliasListener(alias, (inputState) => {

            if (!this._enabled) {
                return;
            }

            const shouldReact = this.filterFunction(inputState, this.initialCache);
            if (shouldReact) {
                const additionalValue = additionalDataFunction();
                inputHandlerFunction(inputState, additionalValue, initialCache);
            }
        })
    }

    isEnabled(): boolean {
        return this._enabled;
    }

    toggle(state: boolean = !this._enabled): void {
        this._enabled = state;
    }

}