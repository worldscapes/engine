// import {EntityBeforeInitEvent, EntityRegisterEffect} from "../../entity";
//
// export function beforeInitAccessor(callback: (registerEventEffect: EntityRegisterEffect) => void) {
//   return {
//     entityCustomMethods: {},
//     eventEffects: {
//       [EntityBeforeInitEvent.Type]: (event: EntityBeforeInitEvent) => {
//         callback(event.registerEventEffect);
//       }
//     },
//   };
// }