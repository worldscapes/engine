import { ConnectionInfo, NetworkAdapterApi } from "../../adapter.api";
import { WebSocket } from "ws";

export class WebsocketClientNetworkAdapter extends NetworkAdapterApi {
  protected socket!: WebSocket;

  constructor(readonly url: string, readonly port: number = 7020) {
    super();

    this.socket = new WebSocket(`ws://${this.url}:${this.port}`);
    this.socket.on("open", () => {
      this.readyResolver.resolve();
    });
    this.socket.on("message", (messageBinaryData) => {
      this.onMessage({
        messageText: messageBinaryData.toString(),
        connectionInfo: this.getConnectionList()[0],
      });
    });
  }

  getConnectionList(): ConnectionInfo[] {
    return [
      {
        id: 1,
        rank: "server",
      },
    ];
  }

  sendMessageById(targetId: number, messageData: string): void {
    this.sendMessageToServer(messageData);
  }

  sendMessageByRank(targetRank: string, messageData: string): void {
    this.sendMessageToServer(messageData);
  }

  sendMessageToAll(messageData: string): void {
    this.sendMessageToServer(messageData);
  }

  protected sendMessageToServer(messageData: string): void {
    this.socket.send(messageData);
  }
}
