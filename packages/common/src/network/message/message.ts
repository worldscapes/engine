import { getObjectType, WSCStructure } from "../../typing/WSCStructure";
import { Constructor } from "../../utility/types/constructor";
import { ConnectionInfo } from "../adapter/adapter.api";

export abstract class NetworkMessage extends WSCStructure {}

export type NetworkMessageHandler<T extends NetworkMessage> = (
  message: T,
  connectionInfo: ConnectionInfo
) => void;
export type Unsubscriber = () => void;

export class NetworkMessageMapper {
  protected handlers: Record<string, NetworkMessageHandler<NetworkMessage>[]> =
    {};

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
}
