import {InputListener, InputTrigger, InputTriggerTypes} from "../triggers";
import {InputState, InputStateCache} from "../input.system";
import {InputFilterCache} from "../inputFilterCache";

const cache = new InputFilterCache(() => {
    return {
        holdStart: 0,
        lastHoldActivation: 0,
        currentHoldActivatedOnce: true,
    };
});

/**
 * Combines Hold and Press triggers in one action
 */
export class HoldPressCombinator implements InputListener {

    constructor(
        readonly hold: InputTrigger<InputTriggerTypes.Hold>,
        readonly press: InputTrigger<InputTriggerTypes.Press>,
    ) {
    }

    getInputState(inputStateCache: InputStateCache): InputState | undefined {

        const hold = this.hold.getInputState(inputStateCache);
        const press = this.press.getInputState(inputStateCache);

        if (!hold || !press) {
            return undefined;
        }

        return {
            ...hold,
            value: press.value
        };
    }

}