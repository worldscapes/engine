import {ECRSimulationApi} from "../simulation.api";
import {ECRCommandHandler} from "../../command/command-hander";
import {ECRCommand} from "../../command/command";
import {ECRRule} from "../../rule/rule";
import {createEntityHandler} from "../../command/built-in/create-entity.command";
import {deleteEntityHandler} from "../../command/built-in/delete-entity.command";
import {addComponentHandler} from "../../command/built-in/add-component.command";
import {updateComponentHandler} from "../../command/built-in/update-component.command";
import {deleteComponentHandler} from "../../command/built-in/delete-component.command";
import {addResourceHandler} from "../../command/built-in/add-resource.command";
import {updateResourceHandler} from "../../command/built-in/update-resource.command";
import {deleteResourceHandler} from "../../command/built-in/delete-resource.command";
import {ECREntity, SimpleStore} from "../../store/implementations/simple.store";
import {ECRStore} from "../../store/store.api";
import {
    ComponentPurpose,
    EntityRequest,
    ResourcePurpose,
    ResourceRequest
} from "../request/request";
import {
    StoreComponentPurpose,
    StoreComponentSelector,
    StoreEntityRequest,
    StoreResourceRequest, StoreQuerySubscription
} from "../../store/request/request";
import {ECRComponent} from "../../state/component/component";
import {ECRQuery} from "../../query/query";
import {ECRResource} from "../../state/resource/resource";
import {getObjectType} from "../../../typing/WSCStructure";


export interface WorldStateSnapshot {
    entities: ECREntity[],
    components: Record<number, ECRComponent[]>,
    resources: Record<string, ECRResource>
}


export class SimpleSimulation extends ECRSimulationApi {

    protected builtInCommandHandlers: ECRCommandHandler<any>[] = [
        createEntityHandler,
        deleteEntityHandler,

        addComponentHandler,
        updateComponentHandler,
        deleteComponentHandler,

        addResourceHandler,
        updateResourceHandler,
        deleteResourceHandler,
    ];

    protected rules: ECRRule[] = [];
    protected commandHandlers: ECRCommandHandler<any>[] = [
        ...this.builtInCommandHandlers
    ];

    protected injectedCommands: ECRCommand[] = [];

    protected querySubMap = new Map<ECRRule, StoreQuerySubscription>();

    constructor(
        readonly store: ECRStore = new SimpleStore(),
    ) {
        super();
    }

    readonly loadSnapshot = this.store.loadSnapshot.bind(this.store);

    public runSimulationTick()  {
        const handlerTypes = this.commandHandlers.map(handler => handler.commandType);
        const allCommands: ECRCommand[] = [];

        // Handle injected commands
        allCommands.push(...this.handleCommands(this.injectedCommands));
        this.injectedCommands = [];

        // Handle rules
        this.rules.forEach(rule => {

            // Get query data
            const data = this.querySubMap.get(rule)?.getCurrentData();
            if (!data) {
                return;
            }

            // Condition - Check, Read, Write
            const dataForCondition = data;
            // Body - Read, Write
            const dataForBody = {};
            Object.keys(data).forEach((key) => {
                const request = rule.query[key];
                if (request instanceof EntityRequest) {
                    const checkComponentTypes = request
                        .selectors
                        .filter(selector => selector.queryType === ComponentPurpose.CHECK)
                        .map(selector => selector.componentType);

                    dataForBody[key] = (data[key] as ECRComponent[][])
                        .map((entityComponents) => {
                            return entityComponents.filter(component => !checkComponentTypes.includes(Object.getPrototypeOf(component).constructor));
                        });
                }
                if (request instanceof ResourceRequest) {
                    if (request.queryType !== ResourcePurpose.CHECK) {
                        dataForBody[key] = data[key];
                    }
                }
            })


            // Leave if condition is not fulfilled
            const conditionResult = rule.condition(dataForCondition);
            if (!conditionResult) return;

            // Execute rule
            let commands: ECRCommand[] = rule.body(dataForBody) ?? [];

            allCommands.push(...this.handleCommands(commands));
        });

        return {
            snapshot: this.store.getSnapshot(),
            commands: allCommands,
        }
    }

    public addRule(rule: ECRRule): this {
        this.rules.push(rule);

        const storeQuery = this.convertSimulationQueryToStoreQuery(rule.query);

        this.querySubMap.set(rule, this.store.subscribeQuery(storeQuery));

        return this;
    }

    public addCustomCommandHandler<T extends ECRCommand>(handler: ECRCommandHandler<T>): SimpleSimulation {
        this.commandHandlers.push(handler);
        return this;
    }


    public injectCommands(commands: ECRCommand[]): void {
        this.injectedCommands.push(...commands);
    }

    protected handleCommands(commands: ECRCommand[]): ECRCommand[] {
        let commandQueue: ECRCommand[] = [...commands];

        let i = 0;
        while (i < commandQueue.length) {

            const command = commandQueue[i];
            const commandHandler = this.commandHandlers.find(handler => handler.commandType === getObjectType(command));

            if (commandHandler) {
                const returnedCommands = commandHandler.effect(command, this.store);

                if (returnedCommands && returnedCommands.length > 0) {

                    // Insert returned commands after current
                    commandQueue = [ ...commandQueue.slice(0, i + 1), ...returnedCommands, ...commandQueue.slice(i + 1, commandQueue.length) ];
                }
            }

            i++;
        }

        return commandQueue;
    }

    protected convertSimulationQueryToStoreQuery(
        query: ECRQuery<EntityRequest | ResourceRequest>
    ): ECRQuery<StoreEntityRequest | StoreResourceRequest>{
        const storeQuery = {};

        Object.keys(query).forEach(key => {

            const originalRequest = query[key];

            if (originalRequest instanceof EntityRequest) {

                const selectors = originalRequest.selectors.map(selector => {
                    if (selector.queryType === ComponentPurpose.HAS_NOT) {
                        return new StoreComponentSelector(StoreComponentPurpose.HAS_NOT, selector.componentType);
                    } else if (selector.queryType === ComponentPurpose.HAS) {
                        return new StoreComponentSelector(StoreComponentPurpose.HAS, selector.componentType);
                    } else {
                        return new StoreComponentSelector(StoreComponentPurpose.NEEDED, selector.componentType);
                    }
                });

                storeQuery[key] = new StoreEntityRequest(selectors);
            }


            if (originalRequest instanceof ResourceRequest) {
                storeQuery[key] = new StoreResourceRequest(originalRequest.resourceName);
            }
        })

        return storeQuery;
    }

}