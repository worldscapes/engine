// import {EntityEventDispatcher, EntityOnInitEvent} from "../../entity";
//
// export function onInitAccessor(callback: (dispatchEvent: EntityEventDispatcher) => void) {
//   return {
//     entityCustomMethods: {},
//     eventEffects: {
//       [EntityOnInitEvent.Type]: (event: EntityOnInitEvent) => {
//         callback(event.dispatchEvent);
//       }
//     },
//   };
// }