export function getRandomElement<T>(arr: T[]): T {
    const index = Math.round(Math.random() * (arr.length - 1));
    return arr[index];
}