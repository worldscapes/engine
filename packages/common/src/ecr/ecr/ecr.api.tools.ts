import { ECRApi } from "./ecr.api";
import { CreateEntityCommand } from "../command/built-in/create-entity.command";
import { DeleteEntityCommand } from "../command/built-in/delete-entity.command";
import { AddComponentCommand } from "../command/built-in/add-component.command";
import { ECRComponent } from "../state/component/component";
import { UpdateComponentCommand } from "../command/built-in/update-component.command";
import { DeleteComponentCommand } from "../command/built-in/delete-component.command";
import { AddResourceCommand } from "../command/built-in/add-resource.command";
import { UpdateResourceCommand } from "../command/built-in/update-resource.command";
import { DeleteResourceCommand } from "../command/built-in/delete-resource.command";
import { removePrototype } from "../../utility/functions/remove-prototype";
import { WorldStateSnapshot } from "./implementations/simple.ecr";
import { LoadSnapshotCommand } from "../command/built-in/load-snapshot.command";
import { createCommandHandler } from "../command/command-hander";
import { ECRCommand } from "../command/command";
import {
  ComponentPurposes,
  ComponentSelector,
  ECRQuery,
  EntityRequest,
  ResourcePurposes,
  ResourceRequest,
} from "./request/request";
import { ECRRule } from "../rule/rule";

export namespace ECRApiTools {
  export function runTests(
    description: string,
    initializer: () => ECRApi
  ): void {
    class TestComponent extends ECRComponent {
      constructor(protected value: number) {
        super();
      }
    }

    class TestComponent2 extends ECRComponent {
      constructor(protected value: number) {
        super();
      }
    }

    class TestResource extends ECRComponent {
      constructor(protected value: number) {
        super();
      }
    }

    class TestResource2 extends ECRComponent {
      constructor(protected value: number) {
        super();
      }
    }

    describe(description, () => {
      let ecr: ECRApi;
      let testSnapshot: WorldStateSnapshot;

      beforeEach(() => {
        ecr = initializer();
        testSnapshot = {
          entities: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
          components: {
            1: [removePrototype(new TestComponent(0))],
            3: [],
            4: [removePrototype(new TestComponent(1))],
          },
          resources: {
            "test-resource": removePrototype(new TestResource(50)),
          },
        };
      });

      describe("runSimulationTick", () => {
        test("Should return snapshot", () => {
          expect(ecr.runSimulationTick()).toEqual({
            snapshot: {
              entities: [],
              components: {},
              resources: {},
            },
            commands: [],
          });
        });
      });

      describe("injectCommands", () => {
        test("Should handle create-entity command", () => {
          ecr.injectCommands([
            removePrototype(new CreateEntityCommand()),
            removePrototype(new CreateEntityCommand()),
          ]);
          expect(ecr.runSimulationTick().snapshot.entities).toHaveLength(2);
          expect(
            ecr.runSimulationTick().snapshot.entities[0].id !==
              ecr.runSimulationTick().snapshot.entities[1].id
          ).toBeTruthy();
        });

        test("Should handle delete-entity command", () => {
          ecr.injectCommands([removePrototype(new CreateEntityCommand())]);
          const entity = ecr.runSimulationTick().snapshot.entities[0];
          ecr.injectCommands([
            removePrototype(new DeleteEntityCommand(entity.id)),
          ]);
          const snapshot = ecr.runSimulationTick().snapshot;
          expect(snapshot.entities).toHaveLength(0);
        });

        test("Should handle add-component command", () => {
          ecr.injectCommands([removePrototype(new CreateEntityCommand())]);
          const entity = ecr.runSimulationTick().snapshot.entities[0];
          const component = removePrototype(new TestComponent(1));
          ecr.injectCommands([
            removePrototype(new AddComponentCommand(entity.id, component)),
          ]);
          const snapshot = ecr.runSimulationTick().snapshot;
          expect(snapshot.components[entity.id]).toHaveLength(1);
          expect(snapshot.components[entity.id]).toContainEqual(component);
        });

        test("Should handle update-component command", () => {
          const component = removePrototype(new TestComponent(1));
          ecr.injectCommands([
            removePrototype(new CreateEntityCommand([component])),
          ]);
          const entity = ecr.runSimulationTick().snapshot.entities[0];
          const updateComponent = removePrototype(new TestComponent(2));
          ecr.runSimulationTick();
          ecr.injectCommands([
            removePrototype(
              new UpdateComponentCommand(entity.id, component, updateComponent)
            ),
          ]);
          const snapshot = ecr.runSimulationTick().snapshot;
          expect(snapshot.components[entity.id]).toHaveLength(1);
          expect(snapshot.components[entity.id]).toContainEqual(
            updateComponent
          );
        });

        test("Should handle delete-component command", () => {
          ecr.injectCommands([removePrototype(new CreateEntityCommand())]);
          const entity = ecr.runSimulationTick().snapshot.entities[0];
          const component = removePrototype(new TestComponent(1));
          ecr.injectCommands([
            removePrototype(new AddComponentCommand(entity.id, component)),
          ]);
          ecr.runSimulationTick();
          ecr.injectCommands([
            removePrototype(new DeleteComponentCommand(entity.id, component)),
          ]);
          const snapshot = ecr.runSimulationTick().snapshot;
          expect(snapshot.components[entity.id]).toHaveLength(0);
        });

        test("Should handle add-resource command", () => {
          const tag = "test";
          const resource = new TestResource(1);
          ecr.injectCommands([
            removePrototype(new AddResourceCommand(tag, resource)),
          ]);
          const snapshot = ecr.runSimulationTick().snapshot;
          expect(snapshot.resources[tag]).toEqual(resource);
        });

        test("Should handle update-resource command", () => {
          const tag = "test";
          const resource = removePrototype(new TestResource(1));
          const updatedResource = removePrototype(new TestResource(2));
          ecr.injectCommands([
            removePrototype(new AddResourceCommand(tag, resource)),
          ]);
          ecr.runSimulationTick();
          ecr.injectCommands([
            removePrototype(new UpdateResourceCommand(tag, updatedResource)),
          ]);
          const snapshot = ecr.runSimulationTick().snapshot;
          expect(snapshot.resources[tag]).toEqual(updatedResource);
        });

        test("Should handle delete-resource command", () => {
          const tag = "test";
          const resource = removePrototype(new TestResource(1));
          ecr.injectCommands([
            removePrototype(new AddResourceCommand(tag, resource)),
          ]);
          ecr.runSimulationTick();
          ecr.injectCommands([removePrototype(new DeleteResourceCommand(tag))]);
          const snapshot = ecr.runSimulationTick().snapshot;
          expect(snapshot.resources[tag]).toBeUndefined();
        });

        test("Should handle load-snapshot command", () => {
          ecr.injectCommands([
            removePrototype(new LoadSnapshotCommand(testSnapshot)),
          ]);
          const snapshot = ecr.runSimulationTick().snapshot;
          expect(snapshot).toEqual(testSnapshot);
        });

        test("Should follow command order", () => {
          ecr.injectCommands([removePrototype(new CreateEntityCommand())]);

          const entity = ecr.runSimulationTick().snapshot.entities[0];
          const component = removePrototype(new TestComponent(1));
          ecr.injectCommands([
            removePrototype(new AddComponentCommand(entity.id, component)),
            removePrototype(new DeleteComponentCommand(entity.id, component)),
          ]);
          const snapshot = ecr.runSimulationTick().snapshot;
          expect(snapshot.components[entity.id]).toHaveLength(0);

          ecr.injectCommands([
            removePrototype(new DeleteComponentCommand(entity.id, component)),
            removePrototype(new AddComponentCommand(entity.id, component)),
          ]);
          const snapshot2 = ecr.runSimulationTick().snapshot;
          expect(snapshot2.components[entity.id]).toHaveLength(1);
        });
      });

      describe("addCustomCommandHandler", () => {
        class CreateEntityWithComponentsCommand extends ECRCommand {
          constructor(readonly components: ECRComponent[]) {
            super();
          }
        }

        test("Should call custom command handlers", () => {
          const handlerEffect = jest.fn((command, store) => {});
          const handler = createCommandHandler(
            CreateEntityWithComponentsCommand,
            handlerEffect
          );
          ecr.addCustomCommandHandler(handler);
          const command = new CreateEntityWithComponentsCommand([]);
          ecr.injectCommands([command]);
          ecr.runSimulationTick().snapshot;
          expect(handlerEffect).toBeCalledTimes(1);
          expect(handlerEffect.mock.calls[0][0]).toBe(command);
        });

        test("Should handle commands return from handler", () => {
          const handler = createCommandHandler(
            CreateEntityWithComponentsCommand,
            (command, store) => {
              const entityId = store.createEntity();
              return command.components.map(
                (component) => new AddComponentCommand(entityId, component)
              );
            }
          );
          ecr.addCustomCommandHandler(handler);
          const components = [
            removePrototype(new TestComponent(1)),
            removePrototype(new TestComponent(2)),
            removePrototype(new TestComponent(3)),
            removePrototype(new TestComponent(4)),
          ];
          ecr.injectCommands([
            new CreateEntityWithComponentsCommand(components),
          ]);
          const snapshot = ecr.runSimulationTick().snapshot;
          expect(snapshot.entities).toHaveLength(1);
          expect(snapshot.components[snapshot.entities[0].id]).toEqual(
            components
          );
        });
      });

      describe("subscribeDataQuery", () => {
        let dataQuery: ECRQuery;
        let testSnapshot: WorldStateSnapshot;

        beforeEach(() => {
          dataQuery = ECRQuery.create({
            entity: {
              check: new EntityRequest({
                testComponent1: new ComponentSelector(
                    ComponentPurposes.CHECK,
                    TestComponent
                ),
              }),
              has: new EntityRequest({
                testComponent1: new ComponentSelector(
                    ComponentPurposes.HAS,
                    TestComponent
                ),
              }),
              has_not: new EntityRequest({
                testComponent1: new ComponentSelector(
                    ComponentPurposes.HAS_NOT,
                    TestComponent
                ),
              }),
              write: new EntityRequest({
                testComponent1: new ComponentSelector(
                    ComponentPurposes.WRITE,
                    TestComponent
                ),
              }),
              read: new EntityRequest({
                testComponent1: new ComponentSelector(
                    ComponentPurposes.READ,
                    TestComponent
                ),
              }),
            },
            resource: {
              check: new ResourceRequest(
                  ResourcePurposes.CHECK,
                  "testResource1"
              ),
              read: new ResourceRequest(ResourcePurposes.READ, "testResource1"),
              write: new ResourceRequest(
                  ResourcePurposes.WRITE,
                  "testResource1"
              ),
            },
          });

          testSnapshot = {
            entities: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
            components: {
              1: [removePrototype(new TestComponent(1))],
              2: [removePrototype(new TestComponent2(1))],
              3: [
                removePrototype(new TestComponent(1)),
                removePrototype(new TestComponent2(1)),
              ],
              4: [],
            },
            resources: {
              testResource1: removePrototype(new TestResource(1)),
              testResource2: removePrototype(new TestResource2(2)),
            },
          };

          ecr.injectCommands([new LoadSnapshotCommand(testSnapshot)]);
        });

        test("Should call data query handler on initial tick", () => {
          expect.assertions(1);

          ecr.subscribeDataQuery(dataQuery, (data) => {

            expect(data).toEqual({
              entity: {
                check: [{ entityId: 1 }, { entityId: 3 }],
                write: [{ entityId: 1 }, { entityId: 3 }],
                read: [
                  { entityId: 1, testComponent1: new TestComponent(1) },
                  { entityId: 3, testComponent1: new TestComponent(1) },
                ],
                has: [{ entityId: 1 }, { entityId: 3 }],
                has_not: [{ entityId: 2 }, { entityId: 4 }],
              },
              resource: {
                read: new TestResource(1),
              },
            });
          });

          ecr.runSimulationTick();
        });

        test("Should call data query handler on data update", () => {
          expect.assertions(1);

          let calls = 0;


          ecr.subscribeDataQuery(dataQuery, (data) => {

            if (calls < 1) {
              calls += 1;
              ecr.injectCommands([
                  new UpdateComponentCommand(data.entity.read[0].entityId, data.entity.read[0].testComponent1, new TestComponent(2))
              ]);
              return;
            }

            expect(data).toEqual({
              entity: {
                check: [{ entityId: 1 }, { entityId: 3 }],
                write: [{ entityId: 1 }, { entityId: 3 }],
                read: [
                  { entityId: 1, testComponent1: new TestComponent(2) },
                  { entityId: 3, testComponent1: new TestComponent(1) },
                ],
                has: [{ entityId: 1 }, { entityId: 3 }],
                has_not: [{ entityId: 2 }, { entityId: 4 }],
              },
              resource: {
                read: new TestResource(1),
              },
            });
          });

          ecr.runSimulationTick();
          ecr.runSimulationTick();
        });
      });

      describe("addRule", () => {
        let emptyQuery: ECRQuery;
        let resultTestQuery: ECRQuery;
        let testSnapshot: WorldStateSnapshot;

        beforeEach(() => {
          emptyQuery = ECRQuery.create({
            entity: {},
            resource: {},
          });

          resultTestQuery = ECRQuery.create({
            entity: {
              check: new EntityRequest({
                testComponent1: new ComponentSelector(
                  ComponentPurposes.CHECK,
                  TestComponent
                ),
              }),
              has: new EntityRequest({
                testComponent1: new ComponentSelector(
                  ComponentPurposes.HAS,
                  TestComponent
                ),
              }),
              has_not: new EntityRequest({
                testComponent1: new ComponentSelector(
                  ComponentPurposes.HAS_NOT,
                  TestComponent
                ),
              }),
              write: new EntityRequest({
                testComponent1: new ComponentSelector(
                  ComponentPurposes.WRITE,
                  TestComponent
                ),
              }),
              read: new EntityRequest({
                testComponent1: new ComponentSelector(
                  ComponentPurposes.READ,
                  TestComponent
                ),
              }),
            },
            resource: {
              check: new ResourceRequest(
                ResourcePurposes.CHECK,
                "testResource1"
              ),
              read: new ResourceRequest(ResourcePurposes.READ, "testResource1"),
              write: new ResourceRequest(
                ResourcePurposes.WRITE,
                "testResource1"
              ),
            },
          });

          testSnapshot = {
            entities: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
            components: {
              1: [removePrototype(new TestComponent(1))],
              2: [removePrototype(new TestComponent2(1))],
              3: [
                removePrototype(new TestComponent(1)),
                removePrototype(new TestComponent2(1)),
              ],
              4: [],
            },
            resources: {
              testResource1: removePrototype(new TestResource(1)),
              testResource2: removePrototype(new TestResource2(2)),
            },
          };

          ecr.injectCommands([new LoadSnapshotCommand(testSnapshot)]);
        });

        test("Should check custom rule condition", () => {
          const condition = jest.fn(() => true);
          const body = () => {};
          ecr.addRule({
            query: emptyQuery,
            condition,
            body,
          });
          ecr.runSimulationTick();
          expect(condition).toBeCalledTimes(1);
        });

        test("Should call custom rule body when condition returns true", () => {
          const condition = jest.fn(() => true);
          const body = jest.fn(() => {});
          ecr.addRule({
            query: emptyQuery,
            condition,
            body,
          });
          ecr.runSimulationTick();
          expect(body).toBeCalledTimes(1);
        });

        test("Should not call custom rule body when condition returns false", () => {
          const rule = ECRRule.create({
            query: emptyQuery,
            condition: jest.fn(() => false),
            body: jest.fn(() => {}),
          });
          ecr.addRule(rule);
          ecr.runSimulationTick();
          expect(rule.body).not.toBeCalled();
        });

        // Test query results
        test("Should correctly return query result for condition", () => {
          expect.assertions(1);
          const rule = ECRRule.create({
            query: resultTestQuery,
            condition: (data) => {
              expect(data).toEqual({
                entity: {
                  check: [
                    { entityId: 1, testComponent1: new TestComponent(1) },
                    { entityId: 3, testComponent1: new TestComponent(1) },
                  ],
                  write: [
                    { entityId: 1, testComponent1: new TestComponent(1) },
                    { entityId: 3, testComponent1: new TestComponent(1) },
                  ],
                  read: [
                    { entityId: 1, testComponent1: new TestComponent(1) },
                    { entityId: 3, testComponent1: new TestComponent(1) },
                  ],
                  has: [{ entityId: 1 }, { entityId: 3 }],
                  has_not: [{ entityId: 2 }, { entityId: 4 }],
                },
                resource: {
                  check: new TestResource(1),
                  read: new TestResource(1),
                  write: new TestResource(1),
                },
              });
              return true;
            },
            body: () => {},
          });
          ecr.addRule(rule);
          ecr.runSimulationTick();
        });

        test("Should correctly return query result for body", () => {
          expect.assertions(1);
          const rule = ECRRule.create({
            query: resultTestQuery,
            condition: () => true,
            body: (data) => {
              expect(data).toEqual({
                entity: {
                  check: [{ entityId: 1 }, { entityId: 3 }],
                  write: [
                    { entityId: 1, testComponent1: new TestComponent(1) },
                    { entityId: 3, testComponent1: new TestComponent(1) },
                  ],
                  read: [
                    { entityId: 1, testComponent1: new TestComponent(1) },
                    { entityId: 3, testComponent1: new TestComponent(1) },
                  ],
                  has: [{ entityId: 1 }, { entityId: 3 }],
                  has_not: [{ entityId: 2 }, { entityId: 4 }],
                },
                resource: {
                  read: new TestResource(1),
                  write: new TestResource(1),
                },
              });
            },
          });
          ecr.addRule(rule);
          ecr.runSimulationTick();
        });
      });
    });
  }
}
