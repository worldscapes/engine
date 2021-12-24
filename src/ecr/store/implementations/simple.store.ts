import {ECRStore} from "../store.api";
import {ECRComponent} from "../../state/component/component";
import {ECRResource} from "../../state/resource/resource";

export class ECREntity {
    constructor(
        readonly id: number
    ) {}
}

export class SimpleStore extends ECRStore {

    protected entities: ECREntity[] = [];
    protected components: Record<number, ECRComponent[]> = {};
    protected resources: Record<string, ECRResource> = {};

    createEntity(): number {
        const lastId = this.entities.length !== 0 ? this.entities[this.entities.length - 1].id : 0;

        const entity = new ECREntity(lastId + 1);
        this.entities.push(entity);
        this.components[entity.id] = [];

        return lastId + 1;
    }

    deleteEntity(entityId: number): void {
        this.entities = this.entities.filter(entity => entity.id !== entityId);
        delete this.components[entityId];
    }

    addComponent<T extends ECRComponent>(entityId: number, component: T): void {
        this.components[entityId].push(component);
    }

    updateComponent<T extends ECRComponent>(entityId: number, oldComponent: T, newComponent: T): void {
        this.components[entityId].forEach((el, index) => {
            if (el === oldComponent) {
                this.components[entityId][index] = newComponent;
            }
        });
    }

    deleteComponent<T extends ECRComponent>(entityId: number, component: T): void {
        this.components[entityId] = this.components[entityId].filter(el => {
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
    updateResource<T extends ECRResource>(resourceName: string, resource: T): void {
        if (this.resources[resourceName]) {
            this.resources[resourceName] = resource;
        }
    }

    deleteResource<T extends ECRResource>(resourceName: string): void {
        if (this.resources[resourceName]) {
            delete this.resources[resourceName];
        }
    }

    getSnapshot(): { entities: ECREntity[], components: Record<number, ECRComponent[]>, resources: Record<string, ECRResource> } {
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