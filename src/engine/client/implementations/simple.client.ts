import {WorldscapesClientApi} from "../worldscapes-client.api";
import {NetworkClientApi} from "../../../network/client/client-network.api";
import {ECRSimulationApi} from "../../../ecr/simulation/simulation.api";
import {setInterval} from "timers";

export class SimpleEngineClient extends WorldscapesClientApi {

    constructor(
        protected simulation: ECRSimulationApi,
        protected network: NetworkClientApi,
    ) {
        super();
    }

    public start(): void {
        setInterval(() => {

            // Apply changes from server
            const snapshot = this.network.getLastReceivedSnapshot();
            if (snapshot) {
                this.simulation.loadSnapshot(snapshot);
            }

            // Run simulation
            const simulationResult = this.simulation.runSimulationTick();

        }, 1000)
    }

}