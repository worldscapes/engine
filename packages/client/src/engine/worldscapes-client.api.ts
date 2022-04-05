import {UserAction} from "@worldscapes/common";

export abstract class WorldscapesClientApi {
  public abstract start(): void;
  public abstract onInput(event: UserAction): void;
}
