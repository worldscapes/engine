import {Resolver} from "../../utility/classes/resolver";
import {NetworkMessage} from "../message/message";

export type UserId = number;

export interface ConnectionInfo {
    id: UserId,
    rank: 'client' | 'server' | string
}

export interface MessageInfo<T extends NetworkMessage> {
    messageText: string,
    connectionInfo: ConnectionInfo
}

export abstract class NetworkAdapterApi {

    protected readyResolver = new Resolver<void>();

    constructor() {
    }

    onMessage!: (messageInfo: MessageInfo<any>) => void;

    abstract sendMessageToAll(messageData: string): void;
    abstract sendMessageById(targetId: UserId, messageData: string): void;
    abstract sendMessageByRank(targetRank: string, messageData: string): void;
    abstract getConnectionList(): ConnectionInfo[];

    public isReady(): Promise<void> {
        return this.readyResolver.promise;
    }


}