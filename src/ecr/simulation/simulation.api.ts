import { ECRRule } from "../rule/rule";
import { ECRCommand } from "../command/command";
import {ECRCommandEffect, ECRCommandHandler} from "../command/command-hander";
import { WorldStateSnapshot } from "./implementations/simple.simulation";
import {SimulationQuery} from "./request/request";

export interface ECRSimulationResult {
  snapshot: WorldStateSnapshot;
  commands: ECRCommand[];
}

export abstract class ECRSimulationApi {
  public abstract loadSnapshot(snapshot: WorldStateSnapshot): void;

  public abstract runSimulationTick(): ECRSimulationResult;

  public abstract addRule<T extends SimulationQuery>(rule: ECRRule<T>): void;

  public abstract addCustomCommandHandler<T extends ECRCommandEffect>(
    handler: ECRCommandHandler<T>
  ): void;

  public abstract injectCommands(commands: ECRCommand[]): void;
}
