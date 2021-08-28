import {InputListener, InputTriggerTypes} from "./triggers";
import {InputState, InputSystemImpl} from "./input.system";

/**
 * @internal Should stay serializable
 */
export class InputAlias {

    /**
     * Gives current alias bindings
     *
     * If custom bindings are set, they override default ones
     */
    get bindings() {
        return this.customBindings ?? this.defaultBindings;
    }

    constructor(
        readonly name: string,
        readonly allowedTriggerTypes: InputTriggerTypes[],
        readonly defaultBindings: InputListener[],
        protected customBindings?: InputListener[],
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