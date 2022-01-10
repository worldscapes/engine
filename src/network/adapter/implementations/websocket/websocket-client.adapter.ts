import {ConnectionInfo, NetworkAdapterApi} from "../../adapter.api";
import { WebSocket } from 'ws';

export class WebsocketClientNetworkAdapter extends NetworkAdapterApi {

    protected client: WebSocket;

    constructor(
        readonly url: string,
        readonly port: number = 7020
    ) {
        super();

        this.client = new WebSocket(`ws://${this.url}:${this.port}`);
        this.client.on('open', () => {
            this.readyResolver.resolve();
        })
        this.client.on('message', (message) => {
            this.onMessage(message.toString());
        });
    }

    getConnectionList(): ConnectionInfo[] {
        return [
            {
                id: 1,
                rank: 'server'
            }
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

    protected sendMessageToServer(messageData: string) {
        this.client.send(messageData);
    }

}