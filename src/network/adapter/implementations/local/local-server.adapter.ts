import {ConnectionInfo, NetworkAdapterApi} from "../../adapter.api";
import {LocalClientNetworkAdapter} from "./local-client.adapter";

export class LocalServerNetworkAdapter extends NetworkAdapterApi {

    protected clientAdapter!: LocalClientNetworkAdapter;

    constructor(
    ) {
        super();
    }

    getConnectionList(): ConnectionInfo[] {
        return [
            {
                id: 1,
                rank: 'client'
            }
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

    protected sendMessageToClient(messageData: string) {
        if (!this.clientAdapter) {
            throw Error("Tried to send message to client while client is not registered");
        }
        this.clientAdapter.receiveMessage(messageData);
    }

    receiveMessage(messageData: string) {
        this.onMessage?.(messageData);
    }

    registerClient(clientAdapter: LocalClientNetworkAdapter) {
        this.clientAdapter = clientAdapter;
    }

}