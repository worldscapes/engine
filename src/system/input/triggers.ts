import {DeviceType} from "babylonjs";
import {InputState, InputStateCache} from "./input.system";
import {PressFilter} from "./deciders/press.filter";
import {DoubleFilter} from "./deciders/double.filter";
// import {PressNotDoubleDecider} from "./deciders/press-not-double.decider";
// import {PressFirstOfDoubleDecider} from "./deciders/press-first-of-double.decider";
import {HoldFilter} from "./deciders/hold.filter";
// import {ReleaseDecider} from "./deciders/realease.decider";
// import {PressSequenceStop} from "./deciders/press-sequence-stop.decider";
// import {HoldOnceDecider} from "./deciders/hold-once.decider";

export interface InputListener {
    getInputState(inputStateCache: InputStateCache): InputState | undefined;
}

export class InputTrigger<T extends InputTriggerTypes> implements InputListener {

    constructor(
        readonly deviceType: DeviceType,
        readonly triggerKey: number,
        readonly triggerType: T,
    ) {}

    getInputState(inputStateCache: InputStateCache): InputState | undefined {
        return InputTriggers[this.triggerType]?.(this, inputStateCache);
    }
}

export type InputTriggerFilter = (trigger: InputTrigger<any>, globalInputsState: InputStateCache) => InputState | undefined;

export enum InputTriggerTypes {
    Press,
    Double,
    Hold,
}

export const InputTriggers = {

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

export type InputTriggerType = keyof typeof InputTriggerTypes;