import { PlayerAction, PlayerId, WorldStateSnapshot } from "../../../common";

export abstract class NetworkServerApi {
  abstract sendSnapshot(snapshot: WorldStateSnapshot): void;
  abstract getPlayerInput(): Record<PlayerId, PlayerAction[]>;
}
