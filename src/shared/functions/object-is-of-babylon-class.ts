export function objectIsOfBabylonClass<ExpectedClass>(constructor: new (...args) => ExpectedClass, object: any): object is ExpectedClass {
    return object instanceof constructor;
    // return constructor.prototype.getClassName?.() === getClassName(object);
}