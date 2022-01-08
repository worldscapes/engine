import {ECRSimulation} from "../simulation.api";
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
    ECRComponentSimulationQueryType,
    ECREntitySimulationRequest,
    ECRResourceSimulationQueryType,
    ECRResourceSimulationRequest
} from "../request/request";
import {
    ECRComponentStoreQueryType,
    ECRComponentStoreSelector,
    ECREntityStoreRequest,
    ECRResourceStoreRequest, ECRStoreQuerySubscription
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


export class SimpleSimulation extends ECRSimulation {

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

    protected querySubMap = new Map<ECRRule, ECRStoreQuerySubscription>();

    constructor(
        protected store: ECRStore = new SimpleStore(),
    ) {
        super();
    }


    public runSimulationTick()  {
        console.log("------------------");

        const handlerTypes = this.commandHandlers.map(handler => handler.commandType);
        const allCommands: ECRCommand[] = [];

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
                if (request instanceof ECREntitySimulationRequest) {
                    const checkComponentTypes = request
                        .selectors
                        .filter(selector => selector.queryType === ECRComponentSimulationQueryType.CHECK)
                        .map(selector => selector.componentType);

                    dataForBody[key] = (data[key] as ECRComponent[][])
                        .map((entityComponents) => {
                            return entityComponents.filter(component => !checkComponentTypes.includes(Object.getPrototypeOf(component).constructor));
                        });
                }
                if (request instanceof ECRResourceSimulationRequest) {
                    if (request.queryType !== ECRResourceSimulationQueryType.CHECK) {
                        dataForBody[key] = data[key];
                    }
                }
            })


            // Leave if condition is not fulfilled
            const conditionResult = rule.condition(dataForCondition);
            if (!conditionResult) return;

            // Execute rule
            let commands: ECRCommand[] = rule.body(dataForBody) ?? [];

            // Handle commands
            let i = 0;
            while (i < commands.length) {

                const command = commands[i];


                const commandHandlerId = handlerTypes.indexOf(getObjectType(command));
                if (commandHandlerId !== -1) {
                    const returnedCommands = this.commandHandlers[commandHandlerId].effect(command, this.store);
                    if (returnedCommands && returnedCommands.length > 0) {

                        // Insert returned commands after current
                        commands = [ ...commands.slice(0, i + 1), ...returnedCommands, ...commands.slice(i + 1, commands.length) ];
                    }
                }

                i++;
            }
          
            allCommands.push(...commands);
        });

        return {
            snapshot: this.store.getSnapshot(),
            commands: allCommands,
        }
    }

    public addRule(rule: ECRRule) {
        this.rules.push(rule);

        const storeQuery = this.convertSimulationQueryToStoreQuery(rule.query);

        this.querySubMap.set(rule, this.store.subscribeQuery(storeQuery));

        return this;
    }

    public addCustomCommandHandler<T extends ECRCommand>(handler: ECRCommandHandler<T>) {
        this.commandHandlers.push(handler);
        return this;
    }

    protected convertSimulationQueryToStoreQuery(
        query: ECRQuery<ECREntitySimulationRequest | ECRResourceSimulationRequest>
    ): ECRQuery<ECREntityStoreRequest | ECRResourceStoreRequest>{
        const storeQuery = {};

        Object.keys(query).forEach(key => {

            const originalRequest = query[key];

            if (originalRequest instanceof ECREntitySimulationRequest) {

                const selectors = originalRequest.selectors.map(selector => {
                    if (selector.queryType === ECRComponentSimulationQueryType.HAS_NOT) {
                        return new ECRComponentStoreSelector(ECRComponentStoreQueryType.HAS_NOT, selector.componentType);
                    } else if (selector.queryType === ECRComponentSimulationQueryType.HAS) {
                        return new ECRComponentStoreSelector(ECRComponentStoreQueryType.HAS, selector.componentType);
                    } else {
                        return new ECRComponentStoreSelector(ECRComponentStoreQueryType.NEEDED, selector.componentType);
                    }
                });

                storeQuery[key] = new ECREntityStoreRequest(selectors);
            }


            if (originalRequest instanceof ECRResourceSimulationRequest) {
                storeQuery[key] = new ECRResourceStoreRequest(originalRequest.resourceName);
            }
        })

        return storeQuery;
    }

}