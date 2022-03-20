/**
 * @desc
 * Removes prototype of given object.
 * Shallow.
 *
 * Mainly used for testing.
 * Helps to guarantee that logic will handle serializable objects without relying on prototype
 *
 * @param obj
 */
export function removePrototype<T>(obj: T): T {
  Object.setPrototypeOf(obj, Object.prototype);
  return obj;
}
