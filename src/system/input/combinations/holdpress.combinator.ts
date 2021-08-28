import {InputListener, InputTrigger, InputTriggerTypes} from "../triggers";
import {InputState, InputStateCache} from "../input.system";

export class HoldPressCombinator implements InputListener {

    constructor(
        readonly hold: InputTrigger<InputTriggerTypes.Hold>,
        readonly press: InputTrigger<InputTriggerTypes.Press>,
    ) {
    }

    getInputState(inputStateCache: InputStateCache): InputState | undefined {
        const hold = this.hold.getInputState(inputStateCache);
        const press = this.press.getInputState(inputStateCache);

        if (hold && press) {
            return press;
        }

        return undefined;
    }

}