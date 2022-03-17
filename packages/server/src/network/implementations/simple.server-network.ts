import {
  NetworkAdapterApi,
  NetworkMessageMapper,
  UpdatedSnapshotMessage,
  UserAction,
  WorldStateSnapshot,
  UserId
} from "../../../../common";
import { NetworkServerApi } from "../server-network.api";
import {UserInputMessage} from "../../../../client";

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

