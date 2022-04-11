export function isDefined<T>(data: T): data is Exclude<T, undefined> {
    return data !== undefined;
}
