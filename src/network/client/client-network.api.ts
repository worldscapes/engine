import {NetworkAdapterApi} from "../adapter/adapter.api";
import {WorldStateSnapshot} from "../../ecr/simulation/implementations/simple.simulation";

export abstract class NetworkClientApi {

    constructor() {}

    abstract getLastReceivedSnapshot(): WorldStateSnapshot;

    readonly abstract getConnectionList: NetworkAdapterApi['getConnectionList'];
    readonly abstract sendMessageById: NetworkAdapterApi['sendMessageById'];

}