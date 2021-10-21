export function getClassName<T extends {}>(obj: T) {
    if ((obj as unknown as any).getClassName) {
        return (obj as unknown as any).getClassName();
    }
    return Object.getPrototypeOf(obj).constructor.name;
}