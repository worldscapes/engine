import {InputState, InputStateCache} from "../input.system";
import {InputTrigger, InputTriggerFilter} from "../triggers";
import {DeciderCache} from "../deciderCache";

export const MinimalHoldTime = 80;

const cache = new DeciderCache(() => {
    return {
        holdStart: 0,
        lastHoldActivation: 0,
        currentHoldActivatedOnce: true,
    };
});

export const HoldFilter: InputTriggerFilter = (trigger: InputTrigger<any>, globalInputsState: InputStateCache): InputState | undefined => {

    const inputState = globalInputsState[trigger.deviceType]?.[trigger.triggerKey];

    if (!inputState) {
        return undefined;
    }

    let triggerCache = cache.get(trigger);

    const isInputActive = inputState.value != 0;
    if (isInputActive) {
        const timestamp = Date.now();

        const sameInput = triggerCache.holdStart === inputState.timestamp;
        const heldForMinimalTime = timestamp - triggerCache.holdStart > MinimalHoldTime;

        if (sameInput && heldForMinimalTime) {
            const filterState = {
                timestamp: triggerCache.holdStart,
                value: inputState.value,
                activeTotally: timestamp - triggerCache.holdStart,
                heldSinceLastActivation: triggerCache.currentHoldActivatedOnce ? (timestamp - triggerCache.lastHoldActivation) : 0,
                delta: timestamp - triggerCache.lastHoldActivation,
            };
            triggerCache.lastHoldActivation = timestamp;
            triggerCache.currentHoldActivatedOnce = true;
            return filterState;
        }

        if (!sameInput) {
            triggerCache.holdStart = inputState.timestamp;
            triggerCache.currentHoldActivatedOnce = false;
        }
    }
    return undefined;
}