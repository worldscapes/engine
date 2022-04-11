import { ECRStore as StoreClass } from "./store.api";
import { WorldStateSnapshot } from "../ecr/implementations/simple.ecr";
import { ECRComponent } from "../state/component/component";
import { ECRResource } from "../state/resource/resource";
import {
  StoreComponentPurposes,
  StoreComponentSelector,
  StoreEntityRequest,
  StoreQuery,
  StoreResourceRequest,
} from "./request/request";
import { isTypeOf } from "../../typing/WSCStructure";
import { removePrototype } from "../../utility/functions/remove-prototype";

export namespace ECRStoreTools {
  export function runTests(
    description: string,
    initializer: () => StoreClass
  ): void {
    class TestComponent extends ECRComponent {
      constructor(readonly componentValue: number) {
        super();
      }
    }

    class TestComponent2 extends ECRComponent {
      constructor(readonly componentValue: string) {
        super();
      }
    }

    class TestResource extends ECRResource {
      constructor(readonly resourceValue: number) {
        super();
      }
    }

    class TestResource2 extends ECRResource {
      constructor(readonly resourceValue: string) {
        super();
      }
    }

    describe(description, () => {
      let store: StoreClass;
      let testSnapshot: WorldStateSnapshot;

      beforeEach(() => {
        store = initializer();
        testSnapshot = removePrototype({
          entities: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
          components: {
            1: [new TestComponent(0)],
            2: [new TestComponent2("text")],
            3: [],
            4: [new TestComponent(0), new TestComponent2("more text")],
          },
          resources: {
            "test-resource": new TestResource(50),
          },
        });
      });

      describe("getSnapshot", () => {
        test("Should return valid empty snapshot", () => {
          expect(store.getSnapshot()).toMatchObject({
            entities: [],
            components: {},
            resources: {},
          });
        });

        test("Should return loaded snapshot", () => {
          store.loadSnapshot(testSnapshot);
          expect(store.getSnapshot()).toMatchObject(testSnapshot);
        });
      });

      describe("createEntity", () => {
        test("Should create entity with positive id", () => {
          const entityId = store.createEntity();
          expect(store.getSnapshot().entities).toHaveLength(1);
          expect(store.getSnapshot().entities[0].id).toEqual(entityId);
          expect(store.getSnapshot().entities[0].id).toBeGreaterThan(0);
        });


        test("Should create entity with predefined id", () => {
          const entityId = store.createEntity(-5);
          const entityId2 = store.createEntity(-6);

          expect(entityId).toEqual(-5);
          expect(store.getSnapshot().entities).toContainEqual({ id: -5 });
          expect(entityId2).toEqual(-6);
          expect(store.getSnapshot().entities).toContainEqual({ id: -6 });
        });


        test("Should throw when predefined id is taken", () => {
          store.createEntity(-5);
          expect(() => store.createEntity(-5)).toThrow();
        });

        test("Should assigned positive id even is negative id is taken", () => {
          store.createEntity(-5);
          const entityId = store.createEntity();
          expect(entityId).toBeGreaterThan(0);
        });
      });

      describe("deleteEntity", () => {
        test("Should delete entity", () => {
          const id = store.createEntity();
          store.deleteEntity(id);
          expect(store.getSnapshot().entities).toHaveLength(0);
        });

        test("Should delete components when deletes entity", () => {
          const id = store.createEntity();
          const component = removePrototype(new TestComponent(10));
          store.addComponent(id, component);
          store.deleteEntity(id);
          expect(store.getSnapshot().components[id]).not.toBeDefined();
        });
      });

      describe("addComponent", () => {
        test("Should add component to entity", () => {
          const id = store.createEntity();
          const component = removePrototype(new TestComponent(10));
          store.addComponent(id, component);
          expect(store.getSnapshot().components[id]).toContain(component);
        });
      });

      describe("updateComponent", () => {
        test("Should update component", () => {
          const id = store.createEntity();
          const component = removePrototype(new TestComponent(10));
          store.addComponent(id, component);
          const updatedComponent = removePrototype(new TestComponent(15));
          store.updateComponent(id, component, updatedComponent);
          expect(store.getSnapshot().components[id]).not.toContain(component);
          expect(store.getSnapshot().components[id]).toContain(
            updatedComponent
          );
        });

        test("Should throw if updating non-existing component", () => {
          expect.assertions(1);
          const id = store.createEntity();
          const component = removePrototype(new TestComponent(10));
          const updatedComponent = removePrototype(new TestComponent(15));
          expect(() =>
            store.updateComponent(id, component, updatedComponent)
          ).toThrow();
        });
      });

      describe("deleteComponent", () => {
        test("Should delete component", () => {
          const id = store.createEntity();
          const component = removePrototype(new TestComponent(10));
          const component2 = removePrototype(new TestComponent(15));
          store.addComponent(id, component);
          store.addComponent(id, component2);
          store.deleteComponent(id, component);
          expect(store.getSnapshot().components[id]).not.toContain(component);
          expect(store.getSnapshot().components[id]).toHaveLength(1);
        });
      });

      describe("addResource", () => {
        test("Should add resource", () => {
          const tag = "test-resource";
          const resource = removePrototype(new TestResource(1));
          store.addResource(tag, resource);
          expect(store.getSnapshot().resources[tag]).toBeDefined();
        });

        test("Should throw when trying to add resource with taken tag", () => {
          const tag = "test-resource";
          const resource = removePrototype(new TestResource(1));
          const resource2 = removePrototype(new TestResource(1));
          store.addResource(tag, resource);
          expect(() => store.addResource(tag, resource2)).toThrow();
        });
      });

      describe("updateResource", () => {
        test("Should update resource", () => {
          const tag = "test-resource";
          const resource = removePrototype(new TestResource(1));
          const updatedResource = removePrototype(new TestResource(1));
          store.addResource(tag, resource);
          store.updateResource(tag, updatedResource);
          expect(store.getSnapshot().resources[tag]).toBe(updatedResource);
        });

        test("Should throw when trying to change resource type", () => {
          const tag = "test-resource";
          const resource = removePrototype(new TestResource(1));
          const updatedResource = removePrototype(new TestResource2("test"));
          store.addResource(tag, resource);
          expect(() => store.updateResource(tag, updatedResource)).toThrow();
        });

        test("Should set resource when trying to update non-existent resource", () => {
          const tag = "test-resource";
          const resource = removePrototype(new TestResource(1));
          store.updateResource(tag, resource);
          expect(() => store.getSnapshot().resources[tag]).toBeDefined();
        });
      });

      describe("deleteResource", () => {
        test("Should delete resource", () => {
          const tag = "test-resource";
          const resource = removePrototype(new TestResource(1));
          store.addResource(tag, resource);
          store.deleteResource(tag);
        });
      });

      describe("executeQuery", () => {
        test("Should return empty result for empty query", () => {
          const query = StoreQuery.create({
            entity: {},
            resource: {},
          });
          expect(store.executeQuery(query)).toMatchObject({
            entity: {},
            resource: {},
          });
        });

        test("Should return correct result for [Has] component purpose", () => {
          store.loadSnapshot(testSnapshot);
          const query = StoreQuery.create({
            entity: {
              has: new StoreEntityRequest({
                test: new StoreComponentSelector(
                  StoreComponentPurposes.HAS,
                  TestComponent
                ),
              }),
            },
            resource: {},
          });
          const result = store.executeQuery(query);
          expect(result).toEqual({
            entity: {
              has: [{ entityId: 1 }, { entityId: 4 }],
            },
            resource: {},
          });
        });

        test("Should return correct result for [HAS_NOT] component purpose", () => {
          store.loadSnapshot(testSnapshot);
          const query = StoreQuery.create({
            entity: {
              hasNot: new StoreEntityRequest({
                test: new StoreComponentSelector(
                  StoreComponentPurposes.HAS_NOT,
                  TestComponent
                ),
              }),
            },
            resource: {},
          });
          const result = store.executeQuery(query);
          expect(result).toEqual({
            entity: {
              hasNot: [{ entityId: 2 }, { entityId: 3 }],
            },
            resource: {},
          });
        });

        test("Should return correct result for [RETURN] component purpose", () => {
          store.loadSnapshot(testSnapshot);
          const query = StoreQuery.create({
            entity: {
              get: new StoreEntityRequest({
                test: new StoreComponentSelector(
                  StoreComponentPurposes.RETURN,
                  TestComponent
                ),
              }),
            },
            resource: {},
          });
          const result = store.executeQuery(query);
          expect(result).toEqual({
            entity: {
              get: [
                {
                  entityId: 1,
                  test: testSnapshot.components[1].find((el) =>
                    isTypeOf(el, TestComponent)
                  ),
                },
                {
                  entityId: 4,
                  test: testSnapshot.components[4].find((el) =>
                    isTypeOf(el, TestComponent)
                  ),
                },
              ],
            },
            resource: {},
          });
        });

        test("Should return correct result for resource request", () => {
          store.loadSnapshot(testSnapshot);
          const query = StoreQuery.create({
            entity: {},
            resource: {
              test: new StoreResourceRequest("test-resource"),
            },
          });
          const result = store.executeQuery(query);
          expect(result).toEqual({
            entity: {},
            resource: {
              test: testSnapshot.resources["test-resource"],
            },
          });
        });
      });
    });
  }
}
