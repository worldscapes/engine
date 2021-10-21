// import {InputStateCache} from "../input.system";
// import {InputTrigger, InputTriggerFilter} from "../triggers";
// import {DeciderCache} from "../deciderCache";
//
// const cache = new DeciderCache(() => {
//     return {
//         didReportInactivity: true,
//     };
// });
//
// export const ReleaseDecider: InputTriggerFilter = (trigger: InputTrigger, globalInputsState: InputStateCache): boolean => {
//
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
//         triggerCache.didReportInactivity = false;
//         return false;
//     } else {
//
//         if (triggerCache.didReportInactivity) {
//             return false;
//         }
//
//         triggerCache.didReportInactivity = true;
//         return true;
//     }
// }