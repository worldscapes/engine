import { ECRSimulationResult } from "./simulation/simulation.api";
import { UserAction } from "../display/display.api";
import { UserId } from "../network/adapter/adapter.api";

export abstract class ECRApi {
  public abstract runSimulationTick(): ECRSimulationResult;
  public abstract handleUserInput(input: Record<UserId, UserAction[]>): void;
}