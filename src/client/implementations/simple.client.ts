import {WorldscapesClientApi} from "../worldscapes-client.api";
import {NetworkClientApi} from "../../network/client/client-network.api";

export class SimpleEngineClient extends WorldscapesClientApi {

    constructor(
        protected network: NetworkClientApi,
    ) {
        super();
    }

    public start(): void {

    }

}