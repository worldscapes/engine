import { ECRApi, ECRTickResult, LoadSnapshotCommand, WorldStateSnapshot } from "../../../../common";
import { ClientSimulationApi } from "../client-simulation.api";

export class SimpleClientSimulation extends ClientSimulationApi {
  constructor(protected ecr: ECRApi) {
    super();
  }

  runSimulationTick(): ECRTickResult {
    return this.ecr.runSimulationTick();
  }

  public applyServerUpdate(snapshot: WorldStateSnapshot): void {
    this.ecr.injectCommands([ new LoadSnapshotCommand(snapshot) ]);
  }
}
