/**
 * @description
 * Class that can wraps promise and provides access to its _**resolve()**_ and _**reject()**_ as instance methods <br>
 * Mostly used by functions that should resolve after something happens
 */
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