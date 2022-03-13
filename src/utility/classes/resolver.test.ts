import {Resolver} from "./resolver";

describe("Tests for Resolver", () => {

    let resolver: Resolver<number>;

    beforeEach(() => {
        resolver = new Resolver<number>();
    });

    test("Should resolve on resolve()", () => {
        resolver.resolve(55);
        resolver.promise.then(data => expect(data).toBe(55));
    });

    test("Should reject on reject()", () => {
        expect.assertions(1);
        resolver.reject("Whatever");
        resolver.promise.catch(data => expect(data).toBe("Whatever"));
    });
});