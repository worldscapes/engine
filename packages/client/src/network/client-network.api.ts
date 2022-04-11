import { PlayerAction, WorldStateSnapshot } from "@worldscapes/common";

export abstract class NetworkClientApi {
  abstract getLastReceivedSnapshot(): WorldStateSnapshot;
  abstract sendPlayerActions(input: PlayerAction[]): void;
}
