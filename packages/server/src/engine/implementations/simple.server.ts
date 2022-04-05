import { WorldscapesServerApi } from "../worldscapes-server.api";
import { NetworkServerApi } from "../../network/server-network.api";
import { ServerSimulationApi } from "../../simulation/server-simulation.api";

export interface SimpleEngineServerOptions {
  simulationTickInterval: number
}

export class SimpleEngineServer extends WorldscapesServerApi {

  protected defaultOptions: SimpleEngineServerOptions = {
    simulationTickInterval: 32,
  }
  protected options: SimpleEngineServerOptions;

  constructor(
    protected simulation: ServerSimulationApi,
    protected network: NetworkServerApi,
    options?: Partial<SimpleEngineServerOptions>,
  ) {
    super();

    this.options = {
      ...this.defaultOptions,
      ...(options ?? {})
    };
  }

  public start(): void {
    setInterval(() => {
      const simulationResult = this.simulation.runSimulationTick();

      this.network.sendSnapshot(simulationResult.snapshot);

      const userInput = this.network.getUserInput();

      if (Object.keys(userInput).length > 0) {
        this.simulation.handleUserInput(userInput);
      }
    }, this.options.simulationTickInterval);
  }
}
