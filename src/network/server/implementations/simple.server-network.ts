import {NetworkAdapterApi} from "../../adapter/adapter.api";
import {NetworkServerApi} from "../server-network.api";
import {WorldStateSnapshot} from "../../../ecr/simulation/implementations/simple.simulation";
import {NetworkMessageMapper, NetworkMessage} from "../../message/message";
import {UserInput} from "../../../display/display.api";
import {UserInputMessage} from "../../client/implementations/simple.client-network";

export class UpdatedSnapshotMessage extends NetworkMessage {
    constructor(
        readonly snapshot: WorldStateSnapshot
    ) {
        super();
    }
}

export class SimpleNetworkServer extends NetworkServerApi {

    protected accumulatedUserInput: Record<string, UserInput[]> = {};

    protected mapper = new NetworkMessageMapper();

    constructor(
        protected adapter: NetworkAdapterApi
    ) {
        super();

        this.mapper.addMessageHandler(UserInputMessage, ((message, connectionInfo) => {
            this.accumulatedUserInput[connectionInfo.id] = this.accumulatedUserInput[connectionInfo.id] ?? [];
            this.accumulatedUserInput[connectionInfo.id].push(message);
        }));

        adapter.onMessage = ({ messageText, connectionInfo }) => {
            this.mapper.handleMessage(JSON.parse(messageText), connectionInfo);
        }
    }

    sendSnapshot(snapshot: WorldStateSnapshot) {
        this.adapter.sendMessageByRank('client', JSON.stringify(new UpdatedSnapshotMessage(snapshot)));
    }

    getUserInput(): Record<string, UserInput[]> {
        const input = this.accumulatedUserInput;
        this.accumulatedUserInput = {};
        return input;
    }

}