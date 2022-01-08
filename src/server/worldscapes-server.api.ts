import {ECRApi} from "../ecr/ecr.api";
import {NetworkServerApi} from "../network/server.api";

export class WorldscapesServer {

    constructor(
        protected ecr: ECRApi,
        protected network: NetworkServerApi,
    ) {}

    public run() {
        setInterval(
            () => {
                const simulationResult = this.ecr.runSimulationTick();

                const connectionList = this.network.getConnectionList();
                connectionList
                    .filter(connection => connection.rank === 'client')
                    .forEach((connection) => {
                        this.network.sendMessageById(connection.id, JSON.stringify(simulationResult.snapshot, null, 2));
                    })
            },
            1000,
        );
    }

}