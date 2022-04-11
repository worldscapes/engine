import { Resolver } from "../../utility/classes/resolver";
import {PlayerId} from "../../identity/player-info";

export type ConnectionId = number;

export interface ConnectionInfo {
  playerId: PlayerId;
  id: ConnectionId;
  rank: "client" | "server" | string;
}

export interface MessageInfo {
  messageText: string;
  connectionInfo: ConnectionInfo;
}

export abstract class NetworkAdapterApi {
  protected readyResolver = new Resolver<void>();

  onMessage!: (messageInfo: MessageInfo) => void;

  abstract sendMessageToAll(messageData: string): void;
  abstract sendMessageById(targetId: ConnectionId, messageData: string): void;
  abstract sendMessageByRank(targetRank: string, messageData: string): void;
  abstract getConnectionList(): ConnectionInfo[];

  public isReady(): Promise<void> {
    return this.readyResolver.promise;
  }
}
