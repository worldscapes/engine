import {ECRSimulationApi} from "../simulation.api";
import {ECRCommandHandler} from "../../command/command-hander";
import {ECRCommand} from "../../command/command";
import {BodyPurposes, ConditionPurposes, ECRRule} from "../../rule/rule";
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
    CheckComponentPurpose,
    ComponentSelector,
    EntityRequest,
    ExtractSimulationQueryResult,
    HasComponentPurpose,
    HasNotComponentPurpose,
    IComponentPurpose,
    IResourcePurpose,
    ReadComponentPurpose, ResourceRequest,
    SimulationQuery,
    WriteComponentPurpose
} from "../request/request";
import {
    IStoreComponentPurpose,
    StoreComponentSelector,
    StoreEntityRequest,
    StoreHasComponentPurpose,
    StoreHasNotComponentPurpose,
    StoreQueryResult,
    StoreQuerySubscription,
    StoreResourceRequest,
    StoreReturnComponentPurpose

} from "../../store/request/request";
import {ECRComponent} from "../../state/component/component";
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

    protected rules: ECRRule<any>[] = [];
    protected commandHandlers: ECRCommandHandler<any>[] = [
        ...this.builtInCommandHandlers
    ];

    protected injectedCommands: ECRCommand[] = [];

    protected querySubMap = new Map<ECRRule<any>, StoreQuerySubscription<any>>();


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
            const dataForCondition = this.filterResult(data, rule.query, ConditionPurposes);
            // Body - Read, Write
            const dataForBody = this.filterResult(data, rule.query, BodyPurposes);



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

    public addRule<T extends ECRRule<any>>(rule: T): SimpleSimulation {
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
        query: SimulationQuery
    ) {
        const storeQuery = {
            entity: {},
            resource: {}
        }


        Object.keys(query.entity)
            .forEach((entityKey) => {
                const entityRequest = query.entity[entityKey];

                const selectors = {};

                Object.keys(entityRequest.selectors)
                    .forEach((selectorKey) => {
                        const selector: ComponentSelector<any, any> = entityRequest.selectors[selectorKey];
                        selectors[selectorKey] = new StoreComponentSelector(
                            this.mapComponentPurpose(selector.queryType),
                            selector.componentType
                        );
                    })

                storeQuery.entity[entityKey] = new StoreEntityRequest(selectors);
            })

        Object.keys(query.resource)
            .forEach((resourceKey) => {
                storeQuery.resource[resourceKey] = new StoreResourceRequest(query.resource[resourceKey].resourceName);
            })

        return storeQuery;
    }

    protected mapComponentPurpose(simulationPurpose: typeof IComponentPurpose): typeof IStoreComponentPurpose {
        const isCheck = simulationPurpose === CheckComponentPurpose;
        const isRead = simulationPurpose === ReadComponentPurpose;
        const isWrite = simulationPurpose === WriteComponentPurpose;
        const isHas = simulationPurpose === HasComponentPurpose;
        const isHasNot = simulationPurpose === HasNotComponentPurpose;

        if (isCheck || isRead || isWrite) {
            return StoreReturnComponentPurpose;
        }

        if (isHas) {
            return StoreHasComponentPurpose;
        }

        if (isHasNot) {
            return StoreHasNotComponentPurpose;
        }

        throw Error(`Cannot map unknown SimulationComponentPurpose [${simulationPurpose.name}]`);
    }

    protected filterResult<
        T extends SimulationQuery,
        Purposes extends ReadonlyArray<typeof IComponentPurpose | typeof IResourcePurpose>
    >(result: StoreQueryResult<any, any>, query: T, allowedPurposes: Purposes)
    : ExtractSimulationQueryResult<T, InstanceType<Purposes[number]>> {

        let filteredResult  = { entity: {}, resource: {} };

        Object.keys(query.entity).forEach(entityKey => {
            const entityRequest: EntityRequest<any> = query.entity[entityKey];

            const allowedSelectorKeys: string[] = [];

            Object.keys(entityRequest.selectors).forEach(selectorKey => {
                const selector: ComponentSelector<any, any> = entityRequest.selectors[selectorKey];
                const isPurposeAllowed = allowedPurposes.includes(selector.queryType);

                if (isPurposeAllowed) { allowedSelectorKeys.push(selectorKey) }
            })

            filteredResult.entity[entityKey] = result.entity[entityKey].map(el =>
                allowedSelectorKeys.reduce(
                    (acc, key) => {
                        acc[key] = el[key];
                        return acc;
                    },
                    {}
                )
            );
        });

        Object.keys(query.resource).forEach(resourceKey => {
            const resourceRequest: ResourceRequest<any, any> = query.resource[resourceKey];
            const isPurposeAllowed = allowedPurposes.includes(resourceRequest.queryType);

            if (isPurposeAllowed) { filteredResult.resource[resourceKey] = result.resource[resourceKey] }
        })

        return filteredResult as ExtractSimulationQueryResult<T, InstanceType<Purposes[number]>>;
    }

}