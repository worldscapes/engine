import {ConnectionId, ConnectionInfo} from "../adapter/adapter.api";
import {Constructor} from "../../utility/types/constructor";
import {NetworkMessage} from "../message/message";

export type NetworkMessageHandler<T extends NetworkMessage> = (
    message: T,
    connectionInfo: ConnectionInfo
) => void;

export type Unsubscriber = () => void;

export abstract class NetworkMessageMapperApi {

    abstract handleMessage(message: NetworkMessage, connectionInfo: ConnectionInfo): void;

    abstract addMessageHandler<T extends NetworkMessage>(
        messageType: Constructor<T>,
        handler: NetworkMessageHandler<T>
    ): Unsubscriber;

    abstract sendMessage(target: 'all' | ConnectionId | string, message: NetworkMessage): void;

}
