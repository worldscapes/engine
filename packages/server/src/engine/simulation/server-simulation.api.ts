import { ECRTickResult, UserAction, UserId } from "../../../../common";

export abstract class ServerSimulationApi {
  public abstract runSimulationTick(): ECRTickResult;
  public abstract handleUserInput(input: Record<UserId, UserAction[]>): void;
}
