import {
  ECRCommandEffect,
  ECRCommandHandler,
} from "../../command/command-hander";
import { ECRCommand } from "../../command/command";
import { BodyPurposes, ConditionPurposes, ECRRule } from "../../rule/rule";
import { createEntityHandler } from "../../command/built-in/create-entity.command";
import { deleteEntityHandler } from "../../command/built-in/delete-entity.command";
import { addComponentHandler } from "../../command/built-in/add-component.command";
import { updateComponentHandler } from "../../command/built-in/update-component.command";
import { deleteComponentHandler } from "../../command/built-in/delete-component.command";
import { addResourceHandler } from "../../command/built-in/add-resource.command";
import { updateResourceHandler } from "../../command/built-in/update-resource.command";
import { deleteResourceHandler } from "../../command/built-in/delete-resource.command";
import {
  ECREntity,
  SimpleStore,
} from "../../store/implementations/simple.store";
import { ECRStore } from "../../store/store.api";
import {
  CheckComponentPurpose,
  ComponentSelector,
  EntityRequest,
  ECRQueryResult,
  HasComponentPurpose,
  HasNotComponentPurpose,
  IComponentPurpose,
  IResourcePurpose,
  ReadComponentPurpose,
  ResourceRequest,
  ECRQuery,
  WriteComponentPurpose,
} from "../request/request";
import {
  IStoreComponentPurpose,
  IStorePurpose,
  StoreComponentSelector,
  StoreEntityRequest,
  StoreHasComponentPurpose,
  StoreHasNotComponentPurpose,
  StoreQuery,
  StoreQueryResult,
  StoreResourceRequest,
  StoreReturnComponentPurpose,
} from "../../store/request/request";
import { ECRComponent } from "../../state/component/component";
import { ECRResource } from "../../state/resource/resource";
import { getObjectType } from "../../../typing/WSCStructure";
import {DataQueryPurposes, DataQuerySubscriptionHandler, ECRApi, ECRTickResult} from "../ecr.api";
import { loadSnapshotHandler } from "../../command/built-in/load-snapshot.command";

export interface WorldStateSnapshot {
  entities: ECREntity[];
  components: Record<number, ECRComponent[]>;
  resources: Record<string, ECRResource>;
}

interface DataQuerySubscriptionInfo {
  handler: DataQuerySubscriptionHandler,
  convertedQuery: StoreQuery
}

/**
 * Responsibilities:
 * 1. Command handler management
 * 2. Rule management
 * 3. Simulation management
 * 4. Query fulfillment
 */
export class SimpleEcr extends ECRApi {
  protected builtInCommandHandlers: ECRCommandHandler[] = [
    createEntityHandler,
    deleteEntityHandler,

    addComponentHandler,
    updateComponentHandler,
    deleteComponentHandler,

    addResourceHandler,
    updateResourceHandler,
    deleteResourceHandler,

    loadSnapshotHandler,
  ];

  protected rules: ECRRule[] = [];
  protected convertedQueryMap = new Map<ECRRule, StoreQuery>();

  protected commandHandlers: ECRCommandHandler[] = [
    ...this.builtInCommandHandlers,
  ];

  protected injectedCommands: ECRCommand[] = [];

  protected dataQuerySubMap = new Map<ECRQuery, DataQuerySubscriptionInfo>();

  constructor(readonly store: ECRStore = new SimpleStore()) {
    super();
  }

  public runSimulationTick(): ECRTickResult {
    const allCommands: ECRCommand[] = [];

    // Handle injected commands
    allCommands.push(...this.handleCommands(this.injectedCommands));
    this.injectedCommands = [];

    // Handle rules
    this.rules.forEach((rule) => {

      // Get query data
      const storeQuery = this.convertedQueryMap.get(rule);
      if (!storeQuery) {
        return;
      }
      const data = this.store.executeQuery(storeQuery);

      // Condition - Check, Read, Write
      const dataForCondition = this.filterResult(
        data,
        rule.query,
        ConditionPurposes
      );
      // Body - Read, Write
      const dataForBody = this.filterResult(data, rule.query, BodyPurposes);

      // Leave if condition is not fulfilled
      const conditionResult = rule.condition(dataForCondition);
      if (!conditionResult) return;

      // Execute rule
      const commands: ECRCommand[] = rule.body(dataForBody) ?? [];

      allCommands.push(...this.handleCommands(commands));
    });

    // Execute all Data Queries

    Array.from(this.dataQuerySubMap.entries()).forEach(([query, info]) => {
      const data = this.store.executeQuery(info.convertedQuery);
      const dataForHandler = this.filterResult(data, query, DataQueryPurposes);
      info.handler(dataForHandler);
    });

    return {
      snapshot: this.store.getSnapshot(),
      commands: allCommands,
    };
  }

  public addRule<T extends ECRQuery>(rule: ECRRule<T>): SimpleEcr {
    this.rules.push(rule as unknown as ECRRule);

    this.convertedQueryMap.set(
      rule as unknown as ECRRule,
      this.convertSimulationQueryToStoreQuery(rule.query)
    );

    return this;
  }

  public subscribeDataQuery<T extends ECRQuery>(query: T, handler: DataQuerySubscriptionHandler<T>): void {
    this.dataQuerySubMap.set(
        query,
        {
          handler: handler as unknown as DataQuerySubscriptionHandler,
          convertedQuery: this.convertSimulationQueryToStoreQuery(query)
        }
    );
  }

  public addCustomCommandHandler<T extends ECRCommandEffect>(
    handler: ECRCommandHandler<T>
  ): SimpleEcr {
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
      const commandHandler = this.commandHandlers.find(
        (handler) => handler.commandType === getObjectType(command)
      );

      if (commandHandler) {
        const returnedCommands = commandHandler.effect(command, this.store);

        if (returnedCommands && returnedCommands.length > 0) {
          // Insert returned commands after current
          commandQueue = [
            ...commandQueue.slice(0, i + 1),
            ...returnedCommands,
            ...commandQueue.slice(i + 1, commandQueue.length),
          ];
        }
      }

      i++;
    }

    return commandQueue;
  }

  protected convertSimulationQueryToStoreQuery(query: ECRQuery): StoreQuery {
    const storeQuery = {
      entity: {},
      resource: {},
    };

    Object.keys(query.entity).forEach((entityKey) => {
      const entityRequest = query.entity[entityKey];

      const selectors = {};

      Object.keys(entityRequest.selectors).forEach((selectorKey) => {
        const selector: ComponentSelector =
          entityRequest.selectors[selectorKey];
        selectors[selectorKey] = new StoreComponentSelector(
          this.mapComponentPurpose(selector.queryType),
          selector.componentType
        );
      });

      storeQuery.entity[entityKey] = new StoreEntityRequest(selectors);
    });

    Object.keys(query.resource).forEach((resourceKey) => {
      storeQuery.resource[resourceKey] = new StoreResourceRequest(
        query.resource[resourceKey].resourceName
      );
    });

    return storeQuery;
  }

  protected mapComponentPurpose(
    simulationPurpose: typeof IComponentPurpose
  ): typeof IStoreComponentPurpose {
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

    throw Error(
      `Cannot map unknown SimulationComponentPurpose [${simulationPurpose.name}]`
    );
  }

  protected filterResult<
    T extends ECRQuery,
    Purposes extends ReadonlyArray<
      typeof IComponentPurpose | typeof IResourcePurpose
    >
  >(
    result: StoreQueryResult<T, IStorePurpose>,
    query: T,
    allowedPurposes: Purposes
  ): ECRQueryResult<T, InstanceType<Purposes[number]>> {
    const filteredResult = { entity: {}, resource: {} };

    Object.keys(query.entity).forEach((entityKey) => {
      const entityRequest: EntityRequest = query.entity[entityKey];

      const allowedSelectorKeys: string[] = [];

      Object.keys(entityRequest.selectors).forEach((selectorKey) => {
        const selector: ComponentSelector =
          entityRequest.selectors[selectorKey];
        const isPurposeAllowed = allowedPurposes.includes(selector.queryType);

        if (isPurposeAllowed) {
          allowedSelectorKeys.push(selectorKey);
        }
      });

      filteredResult.entity[entityKey] = result.entity[entityKey].map((el) =>
        allowedSelectorKeys.reduce(
          (acc, key) => {
            acc[key] = el[key];
            return acc;
          },
          { entityId: el.entityId }
        )
      );
    });

    Object.keys(query.resource).forEach((resourceKey) => {
      const resourceRequest: ResourceRequest = query.resource[resourceKey];
      const isPurposeAllowed = allowedPurposes.includes(
        resourceRequest.queryType
      );

      if (isPurposeAllowed) {
        filteredResult.resource[resourceKey] = result.resource[resourceKey];
      }
    });

    return filteredResult as ECRQueryResult<T, InstanceType<Purposes[number]>>;
  }
}
