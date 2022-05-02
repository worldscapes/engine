import {
  UpdatedSnapshotMessage,
  PlayerAction,
  PlayerId,
  PlayerInputMessage,
  WorldStateSnapshot,
  NetworkMessageMapperApi, ConnectionInfo
} from "@worldscapes/common";
import { NetworkServerApi } from "../server-network.api";

export class SimpleNetworkServer extends NetworkServerApi {
  protected accumulatedPlayerInput: Record<PlayerId, PlayerAction[]> = {};


  constructor(
      protected mapper: NetworkMessageMapperApi,
  ) {
    super();

    this.mapper.addMessageHandler(
      PlayerInputMessage,
      this.accumulatePlayerInput.bind(this)
    );

  }

  sendSnapshot(snapshot: WorldStateSnapshot): void {
    this.mapper.sendMessage(
      "client",
      new UpdatedSnapshotMessage(snapshot)
    );
  }

  getPlayerInput(): Record<PlayerId, PlayerAction[]> {
    const input = this.accumulatedPlayerInput;
    this.accumulatedPlayerInput = {};
    return input;
  }

  protected accumulatePlayerInput(message: PlayerInputMessage, connectionInfo: ConnectionInfo): void {

    if (!this.accumulatedPlayerInput[connectionInfo.playerId]) {
      this.accumulatedPlayerInput[connectionInfo.playerId] = [];
    }

    this.accumulatedPlayerInput[connectionInfo.playerId].push(...message.input);
  }
}
