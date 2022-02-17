import { ECRStore } from "../store.api";
import { ECRComponent } from "../../state/component/component";
import { ECRResource } from "../../state/resource/resource";
import {
  StoreEntityRequest,
  StoreResourceRequest,
  StoreQueryResult,
  StoreQuerySubscription,
  StoreQuery,
  StoreComponentSelector,
  StoreReturnComponentPurpose,
  StoreComponentPurposes,
} from "../request/request";
import { isTypeOf } from "../../../typing/WSCStructure";
import { WorldStateSnapshot } from "../../ecr/implementations/simple.ecr";

export class ECREntity {
  constructor(readonly id: number) {}
}

export class SimpleStore extends ECRStore {
  protected entities: ECREntity[] = [];
  protected components: Record<number, ECRComponent[]> = {};
  protected resources: Record<string, ECRResource> = {};

  executeQuery<T extends StoreQuery>(
    query: T
  ): StoreQueryResult<T, StoreReturnComponentPurpose> {
    const result = {
      entity: {},
      resource: {},
    };

    // Handle each query request
    Object.keys(query.entity).forEach((requestKey) => {
      const request: StoreEntityRequest = query.entity[requestKey];

      const foundEntities: StoreEntityRequest.Result<typeof request> = [];

      // Check all entities store has
      this.entities.forEach((entity) => {
        const components = this.components[entity.id];

        // Looks for requested components in given entity
        const foundComponents = { entityId: entity.id };
        let allFound = false;
        let i = 0;

        const selectorKeyArray = Object.keys(request.selectors);

        while (i < selectorKeyArray.length) {
          const key = selectorKeyArray[i];
          const selector: StoreComponentSelector = request.selectors[key];

          const foundComponent = components.find((component) =>
            isTypeOf(component, selector.componentType)
          );

          if (selector.queryType === StoreComponentPurposes.HAS) {
            if (!foundComponent) {
              break;
            }
          }

          if (selector.queryType === StoreComponentPurposes.HAS_NOT) {
            if (foundComponent) {
              break;
            }
          }

          if (selector.queryType === StoreComponentPurposes.RETURN) {
            if (!foundComponent) {
              break;
            }

            foundComponents[key] = foundComponent;
          }

          i++;
          if (i === selectorKeyArray.length) {
            allFound = true;
          }
        }

        if (allFound) {
          foundEntities.push(foundComponents as typeof foundEntities[number]);
        }
      });

      result.entity[requestKey] = foundEntities;
    });

    // Handle each query request
    Object.keys(query.resource).forEach((key) => {
      const request: StoreResourceRequest = query.resource[key];

      result.resource[key] = this.resources[request.resourceName];
    });

    return result as StoreQueryResult<T, StoreReturnComponentPurpose>;
  }

  subscribeQuery<T extends StoreQuery>(query: T): StoreQuerySubscription<T> {
    return {
      getCurrentData: () => {
        return this.executeQuery(query);
      },
    };
  }

  createEntity(): number {
    const lastId =
      this.entities.length !== 0
        ? this.entities[this.entities.length - 1].id
        : 0;

    const entity = new ECREntity(lastId + 1);
    this.entities.push(entity);
    this.components[entity.id] = [];

    return lastId + 1;
  }

  deleteEntity(entityId: number): void {
    this.entities = this.entities.filter((entity) => entity.id !== entityId);
    delete this.components[entityId];
  }

  addComponent<T extends ECRComponent>(entityId: number, component: T): void {
    this.components[entityId].push(component);
  }

  updateComponent<T extends ECRComponent>(
    entityId: number,
    oldComponent: T,
    newComponent: T
  ): void {
    this.components[entityId].forEach((el, index) => {
      if (el === oldComponent) {
        this.components[entityId][index] = newComponent;
      }
    });
  }

  deleteComponent<T extends ECRComponent>(
    entityId: number,
    component: T
  ): void {
    this.components[entityId] = this.components[entityId].filter((el) => {
      if (el !== component) {
        return el;
      }
    });
  }

  addResource<T extends ECRResource>(resourceName: string, resource: T): void {
    if (!this.resources[resourceName]) {
      this.resources[resourceName] = resource;
    }
  }

  // Can change a type of resource
  updateResource<T extends ECRResource>(
    resourceName: string,
    resource: T
  ): void {
    this.resources[resourceName] = resource;
  }

  deleteResource<T extends ECRResource>(resourceName: string): void {
    if (this.resources[resourceName]) {
      delete this.resources[resourceName];
    }
  }

  getSnapshot(): {
    entities: ECREntity[];
    components: Record<number, ECRComponent[]>;
    resources: Record<string, ECRResource>;
  } {
    return {
      entities: this.entities,
      components: this.components,
      resources: this.resources,
    };
  }

  loadSnapshot(snapshot: WorldStateSnapshot): void {
    this.entities = snapshot.entities;
    this.components = snapshot.components;
    this.resources = snapshot.resources;
  }
}
