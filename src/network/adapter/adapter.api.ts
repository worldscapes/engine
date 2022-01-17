import {Resolver} from "../../utility/classes/resolver";
import {NetworkMessage} from "../message/message";

export interface ConnectionInfo {
    id: number,
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
    abstract sendMessageById(targetId: number, messageData: string): void;
    abstract sendMessageByRank(targetRank: string, messageData: string): void;
    abstract getConnectionList(): ConnectionInfo[];

    public isReady(): Promise<void> {
        return this.readyResolver.promise;
    }


}