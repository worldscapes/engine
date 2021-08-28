import {InputState, InputStateCache} from "../input.system";
import {InputTrigger, InputTriggerFilter} from "../triggers";
import {DeciderCache} from "../deciderCache";

const cache = new DeciderCache(() => {
    return {
        lastTimeActivated: 0,
    };
});

export const PressFilter: InputTriggerFilter = (trigger: InputTrigger<any>, globalInputsState: InputStateCache): InputState | undefined => {
    const inputState = globalInputsState[trigger.deviceType]?.[trigger.triggerKey];

    if (!inputState) {
        return undefined;
    }

    let triggerCache = cache.get(trigger);

    const isInputActive = inputState.value != 0;
    if (isInputActive) {

        const triggerCalledForDifferentInput = triggerCache.lastTimeActivated !== inputState.timestamp;

        if (triggerCalledForDifferentInput) {
            const filterValue = {
                timestamp: inputState.timestamp,
                value: inputState.value,
                activeTotally: 0,
                heldSinceLastActivation: 0,
                delta: inputState.timestamp - triggerCache.lastTimeActivated,
            };
            triggerCache.lastTimeActivated = inputState.timestamp;
            return filterValue;
        }
    }
    return undefined;
}