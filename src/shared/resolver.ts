export class Resolver<T> {

    readonly promise: Promise<T>;

    protected _resolve: (value: T) => void = () => {
    };
    protected _reject: (reason?: any) => void = () => {
    };

    get resolve() {
        return this._resolve;
    }

    get reject() {
        return this._reject;
    }

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        })
    }

}