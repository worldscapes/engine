import { NetworkClientApi } from "../client-network.api";
import {
  UpdatedSnapshotMessage,
  PlayerAction,
  WorldStateSnapshot,
  PlayerInputMessage,
  NetworkMessageMapperApi,
} from "@worldscapes/common";

export class SimpleNetworkClient extends NetworkClientApi {

  protected lastReceivedSnapshot!: WorldStateSnapshot;


  constructor(
      protected mapper: NetworkMessageMapperApi,
  ) {
    super();

    this.mapper.addMessageHandler(UpdatedSnapshotMessage, (message) => {
      this.lastReceivedSnapshot = message.snapshot;
    });

  }

  getLastReceivedSnapshot(): WorldStateSnapshot {
    return this.lastReceivedSnapshot;
  }

  sendPlayerActions(input: PlayerAction[]): void {
    this.mapper.sendMessage(
      "server",
      new PlayerInputMessage(input)
    );
  }
}
