export function getClassName<T extends {}>(obj: T) {
    return Object.getPrototypeOf(obj).constructor.name;
}