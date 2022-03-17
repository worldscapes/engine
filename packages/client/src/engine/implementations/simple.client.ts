import { WorldscapesClientApi } from "../worldscapes-client.api";
import { DisplayApi } from "../../display/display.api";
import { ClientSimulationApi } from "../../simulation/client-simulation.api";
import { UserAction } from "../../../../common";
import { NetworkClientApi } from "../../network/client-network.api";

export class SimpleEngineClient extends WorldscapesClientApi {
  constructor(
    protected simulation: ClientSimulationApi,
    protected network: NetworkClientApi,
    protected display: DisplayApi
  ) {
    super();
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
    }, 1000);
  }
}
