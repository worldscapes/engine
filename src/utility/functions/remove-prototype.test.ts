import {removePrototype} from "./remove-prototype";

describe("removePrototype()", () => {

    class TestClass {}

    test("Should remove prototype", () => {
       const obj = removePrototype(new TestClass());
       expect(obj instanceof TestClass).toBeFalsy();
    });

    test("Should not break equality", () => {
        const obj1 = new TestClass();
        const obj2 = removePrototype(obj1);
        expect(obj1 === obj2).toBeTruthy();
    });
});