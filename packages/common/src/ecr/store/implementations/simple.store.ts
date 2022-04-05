import { ECRStore } from "../store.api";
import { ECRComponent } from "../../state/component/component";
import { ECRResource } from "../../state/resource/resource";
import {
  StoreEntityRequest,
  StoreResourceRequest,
  StoreQueryResult,
  StoreQuery,
  StoreComponentSelector,
  StoreReturnComponentPurpose,
  StoreComponentPurposes,
} from "../request/request";
import {
  getObjectType,
  isSameType,
  isTypeOf,
} from "../../../typing/WSCStructure";
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

  createEntity(predefinedId?: number): number {

    if (predefinedId && this.entities.find(entity => entity.id === predefinedId)) {
      throw new Error(`Trying to take predefined id [${predefinedId}] which is already taken`);
    }

    const idToTake =
      predefinedId ?
        predefinedId
        :
      this.entities.length !== 0
        ? this.entities[this.entities.length - 1].id + 1
        : 1;

    const entity = new ECREntity(idToTake);
    this.entities.push(entity);
    this.components[entity.id] = [];

    return idToTake;
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
    let updated = false;
    this.components[entityId].forEach((el, index) => {
      if (el === oldComponent) {
        this.components[entityId][index] = newComponent;
        updated = true;
      }
    });
    if (!updated) {
      throw new Error("Trying to update non-existing component");
    }
  }

  deleteComponent<T extends ECRComponent>(
    entityId: number,
    component: T
  ): void {
    this.components[entityId] = this.components[entityId].filter((el) => {
      return el !== component;
    });
  }

  addResource<T extends ECRResource>(resourceName: string, resource: T): void {
    if (this.resources[resourceName]) {
      throw new Error(
        `Tried to use resource tag [${resourceName}] which is already taken`
      );
    }
    this.resources[resourceName] = resource;
  }

  // Can change a type of resource
  updateResource<T extends ECRResource>(
    resourceName: string,
    resource: T
  ): void {
    const currentResource = this.resources[resourceName];
    if (currentResource && !isSameType(currentResource, resource)) {
      throw Error(
        `Tried to change resource with [${resourceName}] from type [${getObjectType(
          this.resources[resourceName]
        )}] to type [${getObjectType(resource)}]`
      );
    }
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
