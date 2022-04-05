import { ECRRule } from "../rule/rule";
import { ECRCommand } from "../command/command";
import { ECRCommandEffect, ECRCommandHandler } from "../command/command-hander";
import {ECRQuery, ECRQueryResult, ReadComponentPurpose, ReadResourcePurpose} from "./request/request";
import { WorldStateSnapshot } from "./implementations/simple.ecr";

export interface ECRTickResult {
  snapshot: WorldStateSnapshot;
  commands: ECRCommand[];
}

export const DataQueryPurposes = [
  ReadComponentPurpose,
  ReadResourcePurpose,
] as const;

export type DataQuerySubscriptionHandler<T extends ECRQuery = ECRQuery> =
    (result: ECRQueryResult<T, InstanceType<typeof DataQueryPurposes[number]>>) => void;

export abstract class ECRApi {
  public abstract runSimulationTick(): ECRTickResult;

  public abstract subscribeDataQuery<T extends ECRQuery>(query: T, handler: DataQuerySubscriptionHandler<T>): void;

  public abstract addRule<T extends ECRQuery>(rule: ECRRule<T>): void;

  public abstract addCustomCommandHandler<T extends ECRCommandEffect>(
    handler: ECRCommandHandler<T>
  ): void;

  public abstract injectCommands(commands: ECRCommand[]): void;
}
