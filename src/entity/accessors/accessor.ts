// import { groupFields } from "../../shared/group-fileds";
// import {EntityCustomMethodContainer} from "../entity";
// import {filterUndefined} from "../../shared/removeUndefined";
//
// /**
//  * Object that is used to indirectly change entity and access it's functionality
//  * Provides abstraction layer over entity for:
//  *   - avoiding direct mutations from entity extensions
//  *   - organizing entity lifecycle
//  */
// export type EntityAccessor = {
//   entityCustomMethods?: EntityCustomMethodContainer,
//   eventEffects?: EntityEventEffects,
// };
//
// /**
//  * Merges array of accessors objects to one accessor object
//  * @param accessors Array of accessor to merge
//  *
//  * @returns Merged accessor
//  */
// export function mergeAccessors(accessors: EntityAccessor[]): Required<EntityAccessor> {
//   return {
//     entityCustomMethods: mergeEntityPatches(
//       accessors
//       .map(accessor => accessor.entityCustomMethods)
//       .filter(filterUndefined)
//     ),
//     eventEffects: mergeEventEffects(
//       accessors
//       .map(accessor => accessor.eventEffects)
//       .filter(filterUndefined)
//     ),
//   }
// }
//
// function mergeEntityPatches<T>(entityPatches: Partial<T>[]): T {
//   return entityPatches.reduce(
//     (merged, patch) => Object.assign(merged, patch),
//     {}
//   ) as T;
// }
//
// function mergeEventEffects(effects: EntityEventEffects[]): EntityEventEffects {
//   return Object.entries(groupFields(effects)).reduce(
//     (merged, [key, value]) => ({
//       ...merged,
//       [key]: (event) => value.forEach(effect => effect(event)), // Handler returns value from last returned handler
//     }),
//     {}
//   );
// }