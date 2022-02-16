/**
 * @description
 * Class that can wraps promise and provides access to its _**resolve()**_ and _**reject()**_ as instance methods <br>
 * Mostly used by functions that should resolve after something happens
 */
export class Resolver<T> {
  readonly promise: Promise<T>;

  protected _resolve!: (value: T) => void;
  protected _reject!: (reason?: unknown) => void;

  get resolve(): (value: T) => void {
    return this._resolve;
  }

  get reject(): (reason?: unknown) => void {
    return this._reject;
  }

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }
}
