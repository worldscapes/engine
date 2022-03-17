import {NetworkAdapterApi, NetworkMessage, NetworkMessageMapper, UserAction, WorldStateSnapshot, UpdatedSnapshotMessage} from "../../../../common";
import { NetworkClientApi } from "../client-network.api";

export class UserInputMessage extends NetworkMessage {
  constructor(readonly input: UserAction[]) {
    super();
  }
}

export class SimpleNetworkClient extends NetworkClientApi {
  protected lastReceivedSnapshot!: WorldStateSnapshot;

  protected mapper = new NetworkMessageMapper();

  constructor(protected adapter: NetworkAdapterApi) {
    super();

    this.mapper.addMessageHandler(UpdatedSnapshotMessage, (message) => {
      this.lastReceivedSnapshot = message.snapshot;
    });

    adapter.onMessage = ({ messageText, connectionInfo }) => {
      this.mapper.handleMessage(JSON.parse(messageText), connectionInfo);
    };
  }

  getLastReceivedSnapshot(): WorldStateSnapshot {
    return this.lastReceivedSnapshot;
  }

  sendUserActions(input: UserAction[]): void {
    this.adapter.sendMessageByRank(
      "server",
      JSON.stringify(new UserInputMessage(input))
    );
  }
}
