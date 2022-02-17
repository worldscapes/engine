import { WorldStateSnapshot } from "../../ecr/ecr/implementations/simple.ecr";
import { UserAction } from "../../display/display.api";

export abstract class NetworkClientApi {
  abstract getLastReceivedSnapshot(): WorldStateSnapshot;
  abstract sendUserActions(input: UserAction[]): void;
}
