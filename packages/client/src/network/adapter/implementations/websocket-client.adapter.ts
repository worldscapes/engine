import {ConnectionInfo, NetworkAdapterApi} from "@worldscapes/common";

export class WebsocketClientNetworkAdapter extends NetworkAdapterApi {
  protected socket!: WebSocket;

  constructor(readonly url: string, readonly port: number = 7020) {
    super();

    this.socket = new WebSocket(`ws://${this.url}:${this.port}`);
    this.socket.addEventListener("open", () => {
      this.readyResolver.resolve();
    });
    this.socket.addEventListener("message", (messageEvent) => {
      this.onMessage({
        messageText: messageEvent.data,
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
