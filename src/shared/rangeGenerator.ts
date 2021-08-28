export function* range(min: number, max: number) {
    for (let i = min; i < max; i++)
        yield i;
}