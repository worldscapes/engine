import {InputState, InputStateCache} from "../input.system";
import {InputTrigger, InputTriggerFilter} from "../triggers";
import {PressFilter} from "./press.filter";
import {DeciderCache} from "../deciderCache";

export const DoubleClickDelay = 250;

const cache = new DeciderCache(() => {
    return {
        lastDoubleClickActivation: 0,
        lastTimeTriggeredPress: 0,
        doubleClickActivated: true,
    };
});

export const DoubleFilter: InputTriggerFilter = (trigger: InputTrigger<any>, globalInputsState: InputStateCache): InputState | undefined => {

    const inputState = globalInputsState[trigger.deviceType]?.[trigger.triggerKey];
    if (!inputState) {
        return undefined;
    }

    let triggerCache = cache.get(trigger);

    const isPressed = PressFilter(trigger, globalInputsState);
    if (isPressed) {

        const lessThenDelaySinceClick = inputState.timestamp - triggerCache.lastTimeTriggeredPress < DoubleClickDelay;

        if (lessThenDelaySinceClick && !triggerCache.doubleClickActivated) {
            const filterValue = {
                timestamp: triggerCache.lastTimeTriggeredPress,
                value: 1,
                activeTotally: inputState.timestamp - triggerCache.lastTimeTriggeredPress,
                heldSinceLastActivation: inputState.timestamp - triggerCache.lastTimeTriggeredPress,
                delta: inputState.timestamp - triggerCache.lastDoubleClickActivation,
            };

            triggerCache.doubleClickActivated = true;
            triggerCache.lastDoubleClickActivation = inputState.timestamp;

            return filterValue;
        }

        triggerCache.lastTimeTriggeredPress = inputState.timestamp;
        triggerCache.doubleClickActivated = false;
    }

    return undefined;
}