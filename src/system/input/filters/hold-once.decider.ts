// import {InputStateCache} from "../input.system";
// import {InputTrigger, InputTriggerFilter} from "../triggers";
// import {DeciderCache} from "../deciderCache";
// import {MinimalHoldTime} from "./hold.filter";
//
// const cache = new DeciderCache(() => {
//     return {
//         holdStart: -10000,
//         activatedForThisInput: true,
//     };
// });
//
// export const HoldOnceDecider: InputTriggerFilter = (trigger: InputTrigger, globalInputsState: InputStateCache): boolean => {
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
//         const sameInput = triggerCache.holdStart === inputState.timestamp;
//         const heldForMinimalTime = Date.now() - triggerCache.holdStart > MinimalHoldTime;
//
//         if (sameInput && !triggerCache.activatedForThisInput && heldForMinimalTime) {
//             triggerCache.activatedForThisInput = true;
//             return true;
//         }
//
//         if (!sameInput) {
//             triggerCache.lastTimeActivated = inputState.timestamp;
//             triggerCache.activatedForThisInput = false;
//         }
//     }
//     return false;
// }