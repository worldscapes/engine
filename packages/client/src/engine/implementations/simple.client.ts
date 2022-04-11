import { WorldscapesClientApi } from "../worldscapes-client.api";
import { ClientSimulationApi } from "../../simulation/client-simulation.api";
import { NetworkClientApi } from "../../network/client-network.api";
import {PlayerAction, WorldStateSnapshot} from "@worldscapes/common";

export interface SimpleEngineClientOptions {
  inputBatchingInterval: number
}

export class SimpleEngineClient extends WorldscapesClientApi {

  protected defaultOptions: SimpleEngineClientOptions = { inputBatchingInterval: 16 };
  protected options: SimpleEngineClientOptions;

  protected unhandledInput: PlayerAction[] = [];

  protected latestSnapshot!: WorldStateSnapshot;

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
        this.network.sendPlayerActions(this.unhandledInput);
        this.unhandledInput = [];
      }

      // Apply changes from server
      const snapshot = this.network.getLastReceivedSnapshot();
      if (snapshot) {
        this.simulation.applyServerUpdate(snapshot);
      }

      // Run simulation
      this.latestSnapshot = this.simulation.runSimulationTick().snapshot;

    }, this.options.inputBatchingInterval);
  }

  public onInput(event: PlayerAction): void {
    this.unhandledInput.push(event);
  }

  public getLatestSnapshot(): WorldStateSnapshot {
    return this.latestSnapshot;
  }
}
