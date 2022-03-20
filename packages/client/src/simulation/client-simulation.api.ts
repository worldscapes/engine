import { ECRTickResult, WorldStateSnapshot } from "../../../common";

export abstract class ClientSimulationApi {
  public abstract runSimulationTick(): ECRTickResult;
  public abstract applyServerUpdate(snapshot: WorldStateSnapshot): void;
}
