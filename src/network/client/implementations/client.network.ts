import {NetworkAdapterApi} from "../../adapter/adapter.api";
import {WorldStateSnapshot} from "../../../ecr/simulation/implementations/simple.simulation";

export class SimpleNetworkClient {

    protected lastReceivedSnapshot!: WorldStateSnapshot;

    constructor(
        protected adapter: NetworkAdapterApi
    ) {
        adapter.onMessage = (messageInfo) => {
            this.lastReceivedSnapshot = JSON.parse(messageInfo);
        }
    }

    getLastReceivedSnapshot(): WorldStateSnapshot {
        return this.lastReceivedSnapshot;
    };

    readonly getConnectionList: NetworkAdapterApi['getConnectionList'] = this.adapter.getConnectionList.bind(this.adapter);
    readonly sendMessageById: NetworkAdapterApi['sendMessageById'] = this.adapter.sendMessageById.bind(this.adapter);

}