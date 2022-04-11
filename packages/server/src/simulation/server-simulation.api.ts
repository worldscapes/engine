import { ECRTickResult, PlayerAction, PlayerId } from "@worldscapes/common";

export abstract class ServerSimulationApi {
  public abstract runSimulationTick(): ECRTickResult;
  public abstract handleUserInput(input: Record<PlayerId, PlayerAction[]>): void;
}
