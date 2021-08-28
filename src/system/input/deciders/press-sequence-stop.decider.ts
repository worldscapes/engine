// import {InputStateCache} from "../input.system";
// import {InputTrigger, InputTriggerFilter} from "../triggers";
// import {DeciderCache} from "../deciderCache";
//
// export const StoppedPressSequenceDelay = 400;
//
// const cache = new DeciderCache(() => {
//     return {
//         holdStart: -10000,
//         stopReported: true,
//     };
// });
//
// export const PressSequenceStop: InputTriggerFilter = (trigger: InputTrigger, globalInputsState: InputStateCache): boolean => {
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
//         triggerCache.lastTimeActivated = inputState.timestamp;
//         triggerCache.stopReported = false;
//     } else {
//
//         if (!triggerCache.stopReported) {
//
//             const stopDelayPassed = Date.now() - triggerCache.holdStart > StoppedPressSequenceDelay;
//
//             if (stopDelayPassed) {
//
//                 triggerCache.stopReported = true;
//                 return true;
//             }
//         } else {
//
//             return false;
//         }
//     }
//     return false;
// }