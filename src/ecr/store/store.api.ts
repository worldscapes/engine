import { WorldStateSnapshot } from "../ecr/implementations/simple.ecr";
import { ECRComponent } from "../state/component/component";
import { ECRResource } from "../state/resource/resource";
import { StoreQuerySubscription, StoreQuery } from "./request/request";

export abstract class ECRStore {
  abstract subscribeQuery<T extends StoreQuery>(
    query: T
  ): StoreQuerySubscription<T>;

  abstract executeQuery<T extends StoreQuery>(
    query: T
  ): ReturnType<StoreQuerySubscription<T>["getCurrentData"]>;

  abstract createEntity(): number;

  abstract deleteEntity(entityId: number): void;

  abstract addComponent<T extends ECRComponent>(
    entityId: number,
    component: T
  ): void;

  abstract updateComponent<T extends ECRComponent>(
    entityId: number,
    oldComponent: T,
    updatedComponent: T
  ): void;

  abstract deleteComponent<T extends ECRComponent>(
    entityId: number,
    component: T
  ): void;

  abstract addResource<T extends ECRResource>(
    resourceName: string,
    resource: T
  ): void;

  /**
   * @description
   * **Warning**: Can change a type of resource
   */
  abstract updateResource<T extends ECRResource>(
    resourceName: string,
    updatedResource: T
  ): void;

  abstract deleteResource<T extends ECRResource>(resourceName: string): void;

  abstract getSnapshot(): WorldStateSnapshot;

  abstract loadSnapshot(snapshot: WorldStateSnapshot): void;
}
