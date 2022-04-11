export function isSet<T>(data: T): data is Exclude<T, undefined | null> {
    return data !== undefined && data !== null;
}
