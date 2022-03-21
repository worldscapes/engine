import {ConnectionInfo, NetworkAdapterApi } from "@worldscapes/common";
import { WebSocket, WebSocketServer } from "ws";

export class WebsocketServerNetworkAdapter extends NetworkAdapterApi {
  protected server: WebSocketServer;

  protected clients = new Map<WebSocket, ConnectionInfo>();

  constructor(readonly port: number = 7020) {
    super();

    this.server = new WebSocketServer({
      port: this.port,
    });

    this.server.on("connection", (connection) => {
      this.clients.set(connection, { id: Date.now(), rank: "client" });

      connection.on("message", (message) =>
        this.onMessage({
          messageText: message.toString(),
          connectionInfo: this.clients.get(connection) as ConnectionInfo,
        })
      );
    });

    this.readyResolver.resolve();
  }

  getConnectionList(): ConnectionInfo[] {
    return [...this.clients.values()];
  }

  sendMessageById(targetId: number, messageData: string): void {
    const targetConnection = [...this.clients.entries()].find(
      ([_, value]) => value.id === targetId
    );
    targetConnection?.[0].send(messageData);
  }

  sendMessageByRank(targetRank: string, messageData: string): void {
    // Since all are clients
    this.sendMessageToAll(messageData);
  }

  sendMessageToAll(messageData: string): void {
    const connections = [...this.clients.keys()];
    connections.forEach((connection) => connection.send(messageData));
  }
}
