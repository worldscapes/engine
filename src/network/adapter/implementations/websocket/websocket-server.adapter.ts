import {ConnectionInfo, NetworkAdapterApi} from "../../adapter.api";
import {WebSocket, WebSocketServer} from 'ws';

export class WebsocketServerNetworkAdapter extends NetworkAdapterApi {

    protected server: WebSocketServer;

    protected clients = new Map<number, WebSocket>();

    constructor(
        readonly port: number = 7020,
    ) {
        super();

        this.server = new WebSocketServer({
            port: this.port
        });

        this.server.on('connection', (connection) => {

            this.clients.set(Date.now(), connection);

        });

        this.readyResolver.resolve();
    }

    getConnectionList(): ConnectionInfo[] {
        return [...this.clients.keys()].map((key) => ({
            id: key,
            rank: 'client'
        }));
    }

    sendMessageById(targetId: number, messageData: string): void {
        const targetConnection = this.clients.get(targetId);
        targetConnection?.send(messageData);
    }

    sendMessageByRank(targetRank: string, messageData: string): void {
        // Since all are clients
        this.sendMessageToAll(messageData);
    }

    sendMessageToAll(messageData: string): void {
        const connections = [... this.clients.values()];
        connections.forEach(connection => connection.send(messageData));
    }

}