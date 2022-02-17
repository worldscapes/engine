import { ECRTickResult } from "../../../ecr/ecr/ecr.api";
import { WorldStateSnapshot } from "../../../ecr/ecr/implementations/simple.ecr";

export abstract class ClientSimulationApi {
  public abstract runSimulationTick(): ECRTickResult;
  public abstract applyServerUpdate(snapshot: WorldStateSnapshot): void;
}
