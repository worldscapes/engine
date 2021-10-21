export function timer(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}