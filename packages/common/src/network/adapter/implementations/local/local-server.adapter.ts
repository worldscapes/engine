import { ConnectionInfo, NetworkAdapterApi } from "../../adapter.api";
import { LocalClientNetworkAdapter } from "./local-client.adapter";

export class LocalServerNetworkAdapter extends NetworkAdapterApi {
  protected clientAdapter!: LocalClientNetworkAdapter;

  constructor() {
    super();
  }

  getConnectionList(): ConnectionInfo[] {
    return [
      {
        playerId: "1",
        id: 1,
        rank: "client",
      },
    ];
  }

  sendMessageById(targetId: number, messageData: string): void {
    this.sendMessageToClient(messageData);
  }

  sendMessageByRank(targetRank: string, messageData: string): void {
    this.sendMessageToClient(messageData);
  }

  sendMessageToAll(messageData: string): void {
    this.sendMessageToClient(messageData);
  }

  protected sendMessageToClient(messageData: string): void {
    if (!this.clientAdapter) {
      throw Error(
        "Tried to send message to client while client is not registered"
      );
    }
    this.clientAdapter.receiveMessage(messageData);
  }

  receiveMessage(messageData: string): void {
    this.onMessage?.({
      messageText: messageData,
      connectionInfo: this.getConnectionList()[0],
    });
  }

  registerClient(clientAdapter: LocalClientNetworkAdapter): void {
    this.clientAdapter = clientAdapter;

    this.onConnection?.({
      playerId: "1",
      id: 1,
      rank: "client",
    });
  }
}
