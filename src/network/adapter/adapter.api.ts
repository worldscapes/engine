export interface ConnectionInfo {
    id: number,
    rank: 'client' | 'server' | string
}


export abstract class NetworkAdapterApi {

    constructor() {
    }

    onMessage!: (messageInfo: any) => void;

    abstract sendMessageToAll(messageData: string): void;
    abstract sendMessageById(targetId: number, messageData: string): void;
    abstract sendMessageByRank(targetRank: string, messageData: string): void;
    abstract getConnectionList(): ConnectionInfo[];


}