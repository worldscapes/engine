// import {InputStateCache} from "../input.system";
// import {InputTrigger, InputTriggerFilter} from "../triggers";
// import {DeciderCache} from "../deciderCache";
// import {DoubleClickDelay} from "./double.filter";
//
// const cache = new DeciderCache(() => {
//     return {
//         holdStart: -10000,
//     };
// });
//
// export const PressFirstOfDoubleDecider: InputTriggerFilter = (trigger: InputTrigger, globalInputsState: InputStateCache): boolean => {
//     const inputState = globalInputsState[trigger.deviceType]?.[trigger.triggerKey];
//
//     if (!inputState) {
//         return false;
//     }
//
//     let triggerCache = cache.get(trigger);
//
//     const isInputActive = inputState.value != 0;
//     if (isInputActive) {
//
//         const triggerCalledForDifferentInput = triggerCache.holdStart !== inputState.timestamp;
//         const doublePassed = inputState.timestamp - triggerCache.holdStart > DoubleClickDelay;
//
//         if (triggerCalledForDifferentInput && doublePassed) {
//             triggerCache.lastTimeActivated = inputState.timestamp;
//             return true;
//         }
//     }
//     return false;
// }