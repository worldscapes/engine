import {NetworkMessage} from "../../message/message";
import {ConnectionId, ConnectionInfo, NetworkAdapterApi} from "../../adapter/adapter.api";
import {getObjectType} from "../../../typing/WSCStructure";
import {Constructor} from "../../../utility/types/constructor";
import {NetworkMessageHandler, NetworkMessageMapperApi, Unsubscriber} from "../mapper.api";
import {NetworkSerializerApi} from "../../serializer/serializer.api";

export class OnConnectionMessage extends NetworkMessage {}

export class OnDisconnectionMessage extends NetworkMessage {}

export class SimpleNetworkMessageMapper extends NetworkMessageMapperApi {

    constructor(
        protected adapter: NetworkAdapterApi,
        protected serializer: NetworkSerializerApi,
    ) {
        super();

        this.adapter.onMessage = ({ messageText, connectionInfo }) => {
            this.handleMessage(
                this.serializer.parse(messageText),
                connectionInfo
            );
        };

        this.adapter.onConnection = (connectionInfo) => {
            this.handleMessage(
                new OnConnectionMessage(),
                connectionInfo
            );
        };

        this.adapter.onDisconnection = (connectionInfo) => {
            this.handleMessage(
                new OnDisconnectionMessage(),
                connectionInfo
            );
        };
    }

    protected handlers: Record<string, NetworkMessageHandler<NetworkMessage>[]> = {};

    handleMessage(message: NetworkMessage, connectionInfo: ConnectionInfo): void {
        const currentHandlers = this.handlers[getObjectType(message)];

        currentHandlers?.forEach((handler) => handler(message, connectionInfo));
    }

    addMessageHandler<T extends NetworkMessage>(
        messageType: Constructor<T>,
        handler: NetworkMessageHandler<T>
    ): Unsubscriber {
        this.handlers[messageType.name] = this.handlers[messageType.name] ?? [];
        this.handlers[messageType.name].push(
            handler as NetworkMessageHandler<NetworkMessage>
        );

        return () => {
            this.handlers[messageType.name] = this.handlers[messageType.name].filter(
                (savedHandler) => savedHandler !== handler
            );
        };
    }

    sendMessage(target: 'all' | string | ConnectionId, message: NetworkMessage): void {

        const messageString = this.serializer.stringify(message);

        if (target === 'all') {
            this.adapter.sendMessageToAll(messageString);
        }

        // For ConnectionId
        if (typeof target === 'number') {
            this.adapter.sendMessageById(target, messageString);
        }

        // For Rank
        if (typeof target === 'string') {
            this.adapter.sendMessageByRank(target, messageString);
        }
    }
}
