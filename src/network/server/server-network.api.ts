import {NetworkAdapterApi} from "../adapter/adapter.api";

export abstract class NetworkServerApi {

    constructor() {}

    readonly abstract getConnectionList: NetworkAdapterApi['getConnectionList'];
    readonly abstract sendMessageById: NetworkAdapterApi['sendMessageById'];

}