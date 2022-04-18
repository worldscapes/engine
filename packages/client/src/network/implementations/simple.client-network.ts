import { NetworkClientApi } from "../client-network.api";
import {
  NetworkAdapterApi,
  NetworkMessageMapper,
  UpdatedSnapshotMessage,
  PlayerAction,
  WorldStateSnapshot,
  PlayerInputMessage,
  NetworkSerializerApi,
  SimpleSerializer
} from "@worldscapes/common";

export class SimpleNetworkClient extends NetworkClientApi {
  protected lastReceivedSnapshot!: WorldStateSnapshot;

  protected mapper = new NetworkMessageMapper();

  constructor(
      protected adapter: NetworkAdapterApi,
      protected serializer: NetworkSerializerApi = new SimpleSerializer()
  ) {
    super();

    this.mapper.addMessageHandler(UpdatedSnapshotMessage, (message) => {
      this.lastReceivedSnapshot = message.snapshot;
    });

    adapter.onMessage = ({ messageText, connectionInfo }) => {
      this.mapper.handleMessage(this.serializer.parse(messageText), connectionInfo);
    };
  }

  getLastReceivedSnapshot(): WorldStateSnapshot {
    return this.lastReceivedSnapshot;
  }

  sendPlayerActions(input: PlayerAction[]): void {
    this.adapter.sendMessageByRank(
      "server",
      this.serializer.stringify(new PlayerInputMessage(input))
    );
  }
}
