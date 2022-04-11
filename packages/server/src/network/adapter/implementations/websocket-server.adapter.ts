import {
  AuthServerApi,
  ConnectionInfo,
  isAuthResultReject,
  NetworkAdapterApi, PlayerId
} from "@worldscapes/common";
import { WebSocket, WebSocketServer } from "ws";
import {IncomingMessage} from "http";
import * as crypto from "crypto-js";

export class WebsocketServerNetworkAdapter extends NetworkAdapterApi {

  protected server: WebSocketServer;

  protected clients = new Map<WebSocket, ConnectionInfo>();

  constructor(
      readonly auth: AuthServerApi,
      readonly port: number = 7020,
  ) {
    super();

    this.server = new WebSocketServer({
      port: this.port,
      verifyClient: (info) => {

        const slicedUrl = info.req.url?.slice(1, info.req.url?.length);
        const hexToken = new URLSearchParams(slicedUrl).get("token");
        if (!hexToken) {
          return false;
        }
        const wordArray = crypto.enc.Hex.parse(hexToken);
        const token = crypto.enc.Utf16.stringify(wordArray);

        const authResult = this.auth.checkPlayer(token);

        if (isAuthResultReject(authResult)) {
          return false;
        }

        info.req['playerId'] = authResult.playerId;

        return true;
      }
    });

    this.server.on("connection", (connection, req: IncomingMessage & { playerId: PlayerId }) => {

      this.clients.set(connection, { id: Date.now(), rank: "client", playerId: req.playerId });

      connection.on("message", (message) =>
        this.onMessage({
          messageText: message.toString(),
          connectionInfo: this.clients.get(connection) as ConnectionInfo,
        })
      );

      connection.on("close", () => {
        this.clients.delete(connection);
      });
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
