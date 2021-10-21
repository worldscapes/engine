export function removeUndefinedMutable<T>(obj: T) {
    Object.keys(obj).forEach(key => {
        if (obj[key] === undefined) {
            delete obj[key];
        }
    });
}

export function removeUndefined<T>(obj: T) {
    return Object.entries(obj).reduce((newObj, [key, value]) => {
            if (value === undefined) {
                return {...newObj, [key]: value};
            }
            return newObj;
        },
        {}
    );
}

export function filterUndefined<T>(el: T | undefined): el is T {
    return el !== undefined;
}