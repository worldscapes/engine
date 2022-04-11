import {
  NetworkAdapterApi,
  NetworkMessageMapper,
  UpdatedSnapshotMessage,
  PlayerAction,
  PlayerId,
  PlayerInputMessage,
  WorldStateSnapshot
} from "@worldscapes/common";
import { NetworkServerApi } from "../server-network.api";

export class SimpleNetworkServer extends NetworkServerApi {
  protected accumulatedPlayerInput: Record<PlayerId, PlayerAction[]> = {};

  protected mapper = new NetworkMessageMapper();

  constructor(
      protected adapter: NetworkAdapterApi
  ) {
    super();

    this.mapper.addMessageHandler(
      PlayerInputMessage,
      (message, connectionInfo) => {
        this.accumulatedPlayerInput[connectionInfo.playerId] =
          this.accumulatedPlayerInput[connectionInfo.playerId] ?? [];
        this.accumulatedPlayerInput[connectionInfo.playerId].push(...message.input);
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

  getPlayerInput(): Record<PlayerId, PlayerAction[]> {
    const input = this.accumulatedPlayerInput;
    this.accumulatedPlayerInput = {};
    return input;
  }
}
