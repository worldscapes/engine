// import {InputStateCache} from "../input.system";
// import {InputTrigger, InputTriggerFilter} from "../triggers";
// import {DeciderCache} from "../deciderCache";
// import {DoubleClickDelay} from "./double.filter";
//
// const cache = new DeciderCache(() => {
//     return {
//         holdStart: -10000,
//         activatedForThisInput: true,
//     };
// });
//
// export const PressNotDoubleDecider: InputTriggerFilter = (trigger: InputTrigger, globalInputsState: InputStateCache): boolean => {
//     const inputState = globalInputsState[trigger.deviceType]?.[trigger.triggerKey];
//
//     if (!inputState) {
//         return false;
//     }
//
//     let triggerCache = cache.get(trigger);
//
//     let activate = false;
//     const doublePassed = Date.now() - triggerCache.holdStart > DoubleClickDelay;
//
//     if (doublePassed && !triggerCache.activatedForThisInput) {
//         triggerCache.activatedForThisInput = true;
//         activate = true;
//     }
//
//     const isInputActive = inputState.value != 0;
//     if (isInputActive) {
//
//         const triggerCalledForSameInput = triggerCache.holdStart === inputState.timestamp;
//
//         if (!triggerCalledForSameInput) {
//             triggerCache.lastTimeActivated = inputState.timestamp;
//             triggerCache.activatedForThisInput = false;
//
//             if (!doublePassed) {
//                 triggerCache.activatedForThisInput = true;
//                 activate = false;
//             }
//         }
//     }
//
//     return activate;
// }