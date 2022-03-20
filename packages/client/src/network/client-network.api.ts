import { UserAction, WorldStateSnapshot } from "../../../common";

export abstract class NetworkClientApi {
  abstract getLastReceivedSnapshot(): WorldStateSnapshot;
  abstract sendUserActions(input: UserAction[]): void;
}
