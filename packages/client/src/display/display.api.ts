import { UserAction, WorldStateSnapshot } from "../../../common";

export abstract class DisplayApi {
  onInput?: (event: UserAction) => void;
  takeUpdatedSnapshot?(snapshot: WorldStateSnapshot): void;
}
