type GroupedHandlers<T> = Record<keyof T, T[keyof T][]>;

export function groupFields<T>(handlers: T[]): GroupedHandlers<T> {
    return handlers.reduce(
        (grouped, handler) => Object.keys(handler).reduce((grouped, key) => ({
                ...grouped,
                [key]: [...(grouped[key] ?? []), handler[key]],
            }),
            grouped
        ),
        {} as GroupedHandlers<T>
    );

}