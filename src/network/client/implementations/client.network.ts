import {NetworkAdapterApi} from "../../adapter/adapter.api";

export class SimpleNetworkClient {

    protected lastReceivedSnapshot = {};

    constructor(
        protected adapter: NetworkAdapterApi
    ) {
        adapter.onMessage = (messageInfo) => {
            this.lastReceivedSnapshot = JSON.parse(messageInfo);
            console.log("Client received snapshot: ", messageInfo);
        }
    }

    readonly getConnectionList: NetworkAdapterApi['getConnectionList'] = this.adapter.getConnectionList.bind(this.adapter);
    readonly sendMessageById: NetworkAdapterApi['sendMessageById'] = this.adapter.sendMessageById.bind(this.adapter);

}