import {ECRApi} from "../../../ecr/ecr.api";
import {WorldscapesServerApi} from "../worldscapes-server.api";
import { NetworkServerApi } from "src/network/server/server-network.api";

export class SimpleEngineServer extends WorldscapesServerApi {

    constructor(
        protected ecr: ECRApi,
        protected network: NetworkServerApi,
    ) {
        super();
    }

    public start(): void {
        setInterval(
            () => {
                const simulationResult = this.ecr.runSimulationTick();

                this.network.sendSnapshot(simulationResult.snapshot);
            },
            1000,
        );
    }

}