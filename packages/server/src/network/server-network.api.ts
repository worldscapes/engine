import { UserAction, UserId, WorldStateSnapshot } from "../../../common";

export abstract class NetworkServerApi {
  abstract sendSnapshot(snapshot: WorldStateSnapshot): void;
  abstract getUserInput(): Record<UserId, UserAction[]>;
}
