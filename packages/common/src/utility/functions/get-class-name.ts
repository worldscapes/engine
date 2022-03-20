/**
 * This function should only be used when saving object type to field, not for type checking
 */
export function getClassName<T extends object>(obj: T): string {
  return Object.getPrototypeOf(obj).constructor.name;
}
