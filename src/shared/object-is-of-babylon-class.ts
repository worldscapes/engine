import {getClassName} from "./get-class-name";

export function objectIsOfBabylonClass<ExpectedClass>(constructor: new (...args) => ExpectedClass, object: any): object is ExpectedClass {
    return constructor.prototype.getClassName?.() === getClassName(object);
}