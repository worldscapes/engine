import { ClientSimulationApi } from "../client-simulation.api";
import { ECRApi, ECRTickResult } from "../../../../ecr/ecr/ecr.api";
import { WorldStateSnapshot } from "../../../../ecr/ecr/implementations/simple.ecr";
import {LoadSnapshotCommand} from "../../../../ecr/command/built-in/load-snapshot.command";

export class SimpleClientSimulation extends ClientSimulationApi {
  constructor(protected ecr: ECRApi) {
    super();
  }

  runSimulationTick(): ECRTickResult {
    return this.ecr.runSimulationTick();
  }

  public applyServerUpdate(snapshot: WorldStateSnapshot): void {
    this.ecr.injectCommands([ new LoadSnapshotCommand(snapshot) ])
  }
}
