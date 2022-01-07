import {NetworkAdapterApi} from "./adapter/adapter.api";

export class NetworkServerApi {

    constructor(
        protected adapter: NetworkAdapterApi
    ) {}

    readonly getConnectionList: NetworkAdapterApi['getConnectionList'] = this.adapter.getConnectionList.bind(this.adapter);
    readonly sendMessageById: NetworkAdapterApi['sendMessageById'] = this.adapter.sendMessageById.bind(this.adapter);

}