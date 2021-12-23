import {ECRStore} from "../store.api";
import {ECRComponent} from "../../state/component/component";
import {ECRResource} from "../../state/resource/resource";
import {Constructor} from "../../../utility/types/constructor";
import {getClassName} from "../../../utility/functions/get-class-name";

class Entity {
    constructor(
        readonly id: number
    ) {}
}

export class SimpleStore extends ECRStore {

    protected entities: Entity[] = [];
    protected components: Record<number, ECRComponent[]> = {};
    protected resources: Record<string, ECRResource> = {};

    addEntity(): number {
        const lastId = this.entities.length !== 0 ? this.entities[this.entities.length - 1].id : 1;

        const entity = new Entity(lastId + 1);
        this.entities.push(entity);
        this.components[entity.id] = [];

        return lastId + 1;
    }

    deleteEntity(entityId: number): void {
        this.entities.filter(entity => entity.id !== entityId);
        delete this.components[entityId];
    }

    addComponent<T extends ECRComponent>(entityId: number, component: T): void {
        this.components[entityId].push(component);
    }

    updateComponent<T extends ECRComponent>(entityId: number, component: T): void {
        this.components[entityId].map(el => {
            if (getClassName(el) === getClassName(component)) {
                return component;
            }
            return el;
        });
    }

    deleteComponent<T extends ECRComponent>(entityId: number, component: Constructor<T>): void {
        this.components[entityId].filter(el => {
            if (getClassName(el) !== getClassName(component)) {
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
    updateResource<T extends ECRResource>(resourceName: string, resource: T): void {
        if (this.resources[resourceName]) {
            this.resources[resourceName] = resource;
        }
    }

    removeResource<T extends ECRResource>(resourceName: string): void {
        if (this.resources[resourceName]) {
            delete this.resources[resourceName];
        }
    }

    getSnapshot() {
        return {
            entities: this.entities,
            components: this.components,
            resources: this.resources,
        }
    }

    loadSnapshot() {
        throw Error();
    }

}