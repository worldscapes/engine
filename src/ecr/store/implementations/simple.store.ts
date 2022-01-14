import {ECRStore} from "../store.api";
import {ECRComponent} from "../../state/component/component";
import {ECRResource} from "../../state/resource/resource";
import {ECRQuery} from "../../query/query";
import {
    ECRComponentStoreQueryType,
    ECREntityStoreRequest,
    ECRResourceStoreRequest,
    ECRStoreQuerySubscription
} from "../request/request";
import {isTypeOf} from "../../../typing/WSCStructure";
import {WorldStateSnapshot} from "../../simulation/implementations/simple.simulation";

export class ECREntity {
    constructor(
        readonly id: number
    ) {}
}

export class SimpleStore extends ECRStore {

    protected entities: ECREntity[] = [];
    protected components: Record<number, ECRComponent[]> = {};
    protected resources: Record<string, ECRResource> = {};

    subscribeQuery(query: ECRQuery<ECREntityStoreRequest | ECRResourceStoreRequest>): ECRStoreQuerySubscription {
        return {
            getCurrentData: () => {

                const result = {};

                // Handle each query request
                Object.keys(query).forEach(
                    (requestKey) => {
                        const request = query[requestKey];

                        // For Component requests
                        if (request instanceof ECREntityStoreRequest) {

                            const foundEntityComponents: ECRComponent[][] = [];

                            // Check all entities store has
                            this.entities.forEach(entity => {
                                const components = this.components[entity.id];

                                // Looks for requested components in given entity
                                const foundComponents: ECRComponent[] = [];
                                let allFound = false;
                                let i = 0;
                                while (i < request.selectors.length) {
                                    const selector = request.selectors[i];

                                    const foundComponent = components.find(component => isTypeOf(component, selector.componentType));

                                    if (selector.queryType === ECRComponentStoreQueryType.HAS) {
                                        if (!foundComponent) {
                                            break;
                                        }
                                    }

                                    if (selector.queryType === ECRComponentStoreQueryType.HAS_NOT) {
                                        if (foundComponent) {
                                            break;
                                        }
                                    }

                                    if (selector.queryType === ECRComponentStoreQueryType.NEEDED) {
                                        if (!foundComponent) {
                                            break;
                                        }

                                        foundComponents.push(foundComponent);
                                    }


                                    i++;
                                    if (i === request.selectors.length) {
                                        allFound = true;
                                    }
                                }

                                if (allFound) {
                                    foundEntityComponents.push(foundComponents);
                                }
                            })

                            result[requestKey] = foundEntityComponents;
                        }

                        // For Resource requests
                        if (request instanceof ECRResourceStoreRequest) {
                            result[requestKey] = this.resources[request.resourceName];
                        }
                    }
                );

                return result;
            },
        }
    }

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

    loadSnapshot(snapshot: WorldStateSnapshot) {
        this.entities = snapshot.entities;
        this.components = snapshot.components;
        this.resources = snapshot.resources;
    }

}