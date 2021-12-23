import {ECRComponent} from "../state/component/component";
import {ECRResource} from "../state/resource/resource";
import {Constructor} from "../../utility/types/constructor";

export abstract class ECRStore {

    abstract addEntity(): number;

    abstract deleteEntity(entityId: number): void;

    abstract addComponent<T extends ECRComponent>(entityId: number, component: T): void;

    abstract updateComponent<T extends ECRComponent>(entityId: number, component: T): void;

    abstract deleteComponent<T extends ECRComponent>(entityId: number, component: Constructor<T>): void;

    abstract addResource<T extends ECRResource>(resourceName: string, resource: T): void;

    // Can change a type of resource
    abstract updateResource<T extends ECRResource>(resourceName: string, resource: T): void;

    abstract removeResource<T extends ECRResource>(resourceName: string): void;

    abstract getSnapshot();

    abstract loadSnapshot();

}

