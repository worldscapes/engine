import {DeviceType} from "babylonjs";
import {InputState, InputStateCache} from "./input.system";
import {PressFilter} from "./filters/press.filter";
import {DoubleFilter} from "./filters/double.filter";
import {HoldFilter} from "./filters/hold.filter";

/**
 * Interface for all entities that can listen to input
 * It can be InputTrigger or some custom listener type that combines several InputTriggers
 */
export interface InputListener {
    getInputState(inputStateCache: InputStateCache, options?: { loggingEnabled?: boolean }): InputState | undefined;
}

/**
 * Object that contains configuration for input
 */
export class InputTrigger<T extends InputTriggerTypes> implements InputListener {

    constructor(
        readonly deviceType: DeviceType,
        readonly triggerKey: number,
        readonly triggerType: T,
    ) {}

    /**
     * Checks if trigger is active on given input state
     * @param inputStateCache InputStateCache to check
     * @param options Additional options
     * @returns InputState if triggered, otherwise undefined
     */
    getInputState(inputStateCache: InputStateCache, options?: { loggingEnabled?: false }): InputState | undefined {
        return InputTriggerFilters[this.triggerType]?.(this, inputStateCache, { loggingEnabled: options?.loggingEnabled });
    }
}

/**
 * Function that analyses input to decide if trigger was activated
 */
export type InputTriggerFilter = (trigger: InputTrigger<any>, globalInputsState: InputStateCache, options?: { loggingEnabled?: boolean }) => InputState | undefined;


/**
 * List of all implemented input types
 */
export enum InputTriggerTypes {
    Press,
    Double,
    Hold,
}

/**
 * List of trigger type implementations
 */
export const InputTriggerFilters = {

    /**
     * Called when input pressed
     *
     * Will trigger on first input of double
     */
    [InputTriggerTypes.Press]: PressFilter,

    // /**
    //  * Called when input pressed
    //  *
    //  * Will trigger on first input of double, but will not trigger on second
    //  */
    // PressFirstOfDouble: PressFirstOfDoubleDecider,
    //
    // /**
    //  * Called when input pressed
    //  *
    //  * Will NOT trigger on first input of double, but has delay of double click
    //  */
    // PressNotDouble: PressNotDoubleDecider,

    /**
     * Called when input pressed twice in short period of time
     *
     * Warning: Can trigger Press Triggers
     */
    [InputTriggerTypes.Double]: DoubleFilter,

    /**
     * On tickInput check that input state is true and did not change for an interval
     *
     * Always reports true while held
     */
    [InputTriggerTypes.Hold]: HoldFilter,

    // /**
    //  * On tickInput check that input state is true and did not change for an interval
    //  *
    //  * Reports only once
    //  */
    // HoldOnce: HoldOnceDecider,
    //
    // /**
    //  * Simply handled by listening to babylonjs onInputChangedObservable
    //  */
    // Release: ReleaseDecider,
    //
    // /**
    //  * Triggers after user stopped inputting on this input
    //  */
    // PressSequenceStop: PressSequenceStop,

} as const;