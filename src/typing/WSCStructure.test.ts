import {getObjectType, getTypeName, isSameType, isTypeOf, WSCStructure} from "./WSCStructure";
import {removePrototype} from "../utility/functions/remove-prototype";

describe("Typing tools", () => {

    class SomeClass extends WSCStructure {}

    class SomeClass2 extends SomeClass {}

    class SomeClass3 extends SomeClass {}

    describe("WSCStructure", () => {

        test("Should infer correct chain names", () => {
            const obj = removePrototype(new SomeClass2());
            expect(obj.typeChain).toEqual(['SomeClass2', 'SomeClass']);
        });

    });

    describe("getTypeName", () => {

        test("Should return correct type name", () => {
            expect(getTypeName(SomeClass)).toBe("SomeClass");
        });

    });


    describe("getObjectType", () => {

        test("Should return correct type name", () => {
            const obj = removePrototype(new SomeClass());
            expect(getObjectType(obj)).toBe("SomeClass");
        });

    });

    describe("isTypeOf", () => {

        test("Should return true when the given type is in object's typeChain", () => {
            const obj = removePrototype(new SomeClass2());
            expect(isTypeOf(obj, SomeClass)).toBeTruthy();
        });

        test("Should return false when the given type is not in object's typeChain", () => {
            const obj = removePrototype(new SomeClass3());
            expect(isTypeOf(obj, SomeClass2)).toBeFalsy();
        });

    });

    describe("isSameType", () => {
        test("Should return true when objects are of same type", () => {
            const obj = removePrototype(new SomeClass2());
            const obj2 = removePrototype(new SomeClass2());
            expect(isSameType(obj, obj2)).toBeTruthy();
        });

        test("Should return false when objects are of different type", () => {
            const obj = removePrototype(new SomeClass());
            const obj2 = removePrototype(new SomeClass2());
            expect(isSameType(obj, obj2)).toBeFalsy();
        });
    });
});