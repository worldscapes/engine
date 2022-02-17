import { WorldStateSnapshot } from "../../ecr/ecr/implementations/simple.ecr";
import { UserAction } from "../../display/display.api";
import { UserId } from "../adapter/adapter.api";

export abstract class NetworkServerApi {
  abstract sendSnapshot(snapshot: WorldStateSnapshot): void;
  abstract getUserInput(): Record<UserId, UserAction[]>;
}
