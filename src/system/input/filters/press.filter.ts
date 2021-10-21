import {InputState, InputStateCache} from "../input.system";
import {InputTrigger, InputTriggerFilter} from "../triggers";
import {InputFilterCache} from "../inputFilterCache";

const cache = new InputFilterCache(() => {
    return {
        lastTimeActivated: 0,
    };
});

export const PressFilter: InputTriggerFilter = (
    trigger: InputTrigger<any>,
    globalInputsState: InputStateCache,
    options?: { loggingEnabled?: boolean }
): InputState | undefined => {
    const inputState = globalInputsState[trigger.deviceType]?.[trigger.triggerKey];

    if (!inputState) {
        options?.loggingEnabled && console.log(`[PressFilter]: Input state is undefined.`);
        return undefined;
    }

    let triggerCache = cache.get(trigger);

    const isInputActiveAndDifferent = inputState.value != 0 && triggerCache.lastTimeActivated !== inputState.timestamp;
    const notHandledActivationBetweenFrames = inputState.value == 0 && inputState.lastTimeActivated > triggerCache.lastTimeActivated;
    if (isInputActiveAndDifferent || notHandledActivationBetweenFrames) {

        let currentHandledTime;
        let currentHandledValue;

        if (isInputActiveAndDifferent) {
            currentHandledTime = inputState.timestamp;
            currentHandledValue = inputState.value;
        }

        if (notHandledActivationBetweenFrames) {
            currentHandledTime = inputState.lastTimeActivated;
            currentHandledValue = inputState.lastTimeActivatedValue;
        }

        const filterValue = {
            timestamp: currentHandledTime,
            value: currentHandledValue,
            activeTotally: 0,
            heldSinceLastActivation: 0,
            delta: currentHandledTime - triggerCache.lastTimeActivated,
            lastTimeActivated: currentHandledTime,
            lastTimeActivatedValue: currentHandledValue,
        };
        triggerCache.lastTimeActivated = currentHandledTime;

        return filterValue;
    }

    return undefined;
}