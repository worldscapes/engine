import {AuthClientApi, ConnectionInfo, NetworkAdapterApi} from "@worldscapes/common";
import * as crypto from "crypto-js";

export class WebsocketClientNetworkAdapter extends NetworkAdapterApi {
  protected socket!: WebSocket;

  constructor(
      readonly auth: AuthClientApi,
      readonly url: string,
      readonly port: number = 7020,
  ) {
    super();

    const wordArray = crypto.enc.Utf16.parse(auth.getAuthInfoString());
    const hexToken = crypto.enc.Hex.stringify(wordArray);

    this.socket = new WebSocket(`ws://${this.url}:${this.port}?token=${hexToken}`);
    this.socket.onerror = (error) => {
      console.error(error);
    };
    this.socket.onclose = (error) => {
      console.warn(error);
    };

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
        playerId: "0",
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
