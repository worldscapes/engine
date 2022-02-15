import { WorldStateSnapshot } from "../../ecr/simulation/implementations/simple.simulation";
import { UserAction } from "../../display/display.api";
import { UserId } from "../adapter/adapter.api";

export abstract class NetworkServerApi {
  abstract sendSnapshot(snapshot: WorldStateSnapshot): void;
  abstract getUserInput(): Record<UserId, UserAction[]>;
}
