import {PlayerAction, WorldStateSnapshot} from "@worldscapes/common";

export abstract class WorldscapesClientApi {
  public abstract start(): void;
  public abstract onInput(event: PlayerAction): void;
  public abstract getLatestSnapshot(): WorldStateSnapshot;
}
