import { WorldscapesClientApi } from "../worldscapes-client.api";
import { DisplayApi } from "../../display/display.api";
import { ClientSimulationApi } from "../../simulation/client-simulation.api";
import { NetworkClientApi } from "../../network/client-network.api";
import { UserAction } from "@worldscapes/common";

export interface SimpleEngineClientOptions {
  inputBatchingInterval: number
}

export class SimpleEngineClient extends WorldscapesClientApi {

  protected defaultOptions: SimpleEngineClientOptions = { inputBatchingInterval: 16 };
  protected options: SimpleEngineClientOptions;

  constructor(
    protected simulation: ClientSimulationApi,
    protected network: NetworkClientApi,
    protected display: DisplayApi,
    options?: Partial<SimpleEngineClientOptions>
  ) {
    super();

    this.options = {
      ...this.defaultOptions,
      ...(options ?? {})
    };
  }

  public start(): void {
    let unhandledInput: UserAction[] = [];
    this.display.onInput = (event) => {
      unhandledInput.push(event);
    };

    setInterval(() => {
      // Send accumulated user input to server
      if (unhandledInput?.length > 0) {
        this.network.sendUserActions(unhandledInput);
        unhandledInput = [];
      }

      // Apply changes from server
      const snapshot = this.network.getLastReceivedSnapshot();
      if (snapshot) {
        this.simulation.applyServerUpdate(snapshot);
      }

      // Run simulation
      const simulationResult = this.simulation.runSimulationTick();

      this.display.takeUpdatedSnapshot?.(simulationResult.snapshot);
    }, this.options.inputBatchingInterval);
  }
}
