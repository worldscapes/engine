import { UserAction } from "../../../display/display.api";
import { UserId } from "../../../network/adapter/adapter.api";
import { ECRTickResult } from "../../../ecr/ecr/ecr.api";

export abstract class ServerSimulationApi {
  public abstract runSimulationTick(): ECRTickResult;
  public abstract handleUserInput(input: Record<UserId, UserAction[]>): void;
}
