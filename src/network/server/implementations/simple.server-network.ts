import { NetworkAdapterApi, UserId } from "../../adapter/adapter.api";
import { NetworkServerApi } from "../server-network.api";
import { WorldStateSnapshot } from "../../../ecr/simulation/implementations/simple.simulation";
import { NetworkMessageMapper, NetworkMessage } from "../../message/message";
import { UserAction } from "../../../display/display.api";
import { UserInputMessage } from "../../client/implementations/simple.client-network";

export class UpdatedSnapshotMessage extends NetworkMessage {
  constructor(readonly snapshot: WorldStateSnapshot) {
    super();
  }
}

export class SimpleNetworkServer extends NetworkServerApi {
  protected accumulatedUserInput: Record<UserId, UserAction[]> = {};

  protected mapper = new NetworkMessageMapper();

  constructor(protected adapter: NetworkAdapterApi) {
    super();

    this.mapper.addMessageHandler(
      UserInputMessage,
      (message, connectionInfo) => {
        this.accumulatedUserInput[connectionInfo.id] =
          this.accumulatedUserInput[connectionInfo.id] ?? [];
        this.accumulatedUserInput[connectionInfo.id].push(...message.input);
      }
    );

    adapter.onMessage = ({ messageText, connectionInfo }) => {
      this.mapper.handleMessage(JSON.parse(messageText), connectionInfo);
    };
  }

  sendSnapshot(snapshot: WorldStateSnapshot): void {
    this.adapter.sendMessageByRank(
      "client",
      JSON.stringify(new UpdatedSnapshotMessage(snapshot))
    );
  }

  getUserInput(): Record<UserId, UserAction[]> {
    const input = this.accumulatedUserInput;
    this.accumulatedUserInput = {};
    return input;
  }
}
