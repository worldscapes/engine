import { UserAction, WorldStateSnapshot } from "@worldscapes/common";

export abstract class DisplayApi {
  onInput?: (event: UserAction) => void;
  takeUpdatedSnapshot?(snapshot: WorldStateSnapshot): void;
}
