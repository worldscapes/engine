import { ECRRule } from "../rule/rule";
import { ECRCommand } from "../command/command";
import { ECRCommandEffect, ECRCommandHandler } from "../command/command-hander";
import { ECRQuery } from "./request/request";
import { WorldStateSnapshot } from "./implementations/simple.ecr";

export interface ECRTickResult {
  snapshot: WorldStateSnapshot;
  commands: ECRCommand[];
}

export abstract class ECRApi {
  public abstract loadSnapshot(snapshot: WorldStateSnapshot): void;

  public abstract runSimulationTick(): ECRTickResult;

  public abstract addRule<T extends ECRQuery>(rule: ECRRule<T>): void;

  public abstract addCustomCommandHandler<T extends ECRCommandEffect>(
    handler: ECRCommandHandler<T>
  ): void;

  public abstract injectCommands(commands: ECRCommand[]): void;
}
