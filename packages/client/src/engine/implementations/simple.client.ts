import { WorldscapesClientApi } from "../worldscapes-client.api";
import { ClientSimulationApi } from "../../simulation/client-simulation.api";
import { NetworkClientApi } from "../../network/client-network.api";
import { UserAction } from "@worldscapes/common";

export interface SimpleEngineClientOptions {
  inputBatchingInterval: number
}

export class SimpleEngineClient extends WorldscapesClientApi {

  protected defaultOptions: SimpleEngineClientOptions = { inputBatchingInterval: 16 };
  protected options: SimpleEngineClientOptions;

  protected unhandledInput: UserAction[] = [];

  constructor(
    protected simulation: ClientSimulationApi,
    protected network: NetworkClientApi,
    options?: Partial<SimpleEngineClientOptions>
  ) {
    super();

    this.options = {
      ...this.defaultOptions,
      ...(options ?? {})
    };
  }

  public start(): void {

    setInterval(() => {
      // Send accumulated user input to server
      if (this.unhandledInput?.length > 0) {
        this.network.sendUserActions(this.unhandledInput);
        this.unhandledInput = [];
      }

      // Apply changes from server
      const snapshot = this.network.getLastReceivedSnapshot();
      if (snapshot) {
        this.simulation.applyServerUpdate(snapshot);
      }

      // Run simulation
      const simulationResult = this.simulation.runSimulationTick();

    }, this.options.inputBatchingInterval);
  }

  public onInput(event: UserAction): void {
    this.unhandledInput.push(event);
  }
}
