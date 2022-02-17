import { WorldscapesServerApi } from "../worldscapes-server.api";
import { NetworkServerApi } from "../../../network/server/server-network.api";
import { ServerSimulationApi } from "../simulation/server-simulation.api";

export class SimpleEngineServer extends WorldscapesServerApi {
  constructor(
    protected simulation: ServerSimulationApi,
    protected network: NetworkServerApi
  ) {
    super();
  }

  public start(): void {
    setInterval(() => {
      const simulationResult = this.simulation.runSimulationTick();

      this.network.sendSnapshot(simulationResult.snapshot);

      const userInput = this.network.getUserInput();

      if (Object.keys(userInput).length > 0) {
        this.simulation.handleUserInput(userInput);
      }
    }, 1000);
  }
}
