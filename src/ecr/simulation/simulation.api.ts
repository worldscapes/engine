import {ECRRule} from "../rule/rule";
import {ECRCommand} from "../command/command";
import {ECRCommandHandler} from "../command/command-hander";
import {WorldStateSnapshot} from "./implementations/simple.simulation";

export interface ECRSimulationResult {
    snapshot: WorldStateSnapshot;
    commands: ECRCommand[];
}

export abstract class ECRSimulationApi {

    public abstract loadSnapshot(snapshot: WorldStateSnapshot): void;

    public abstract runSimulationTick(): ECRSimulationResult;

    public abstract addRule<T extends ECRRule<any>>(rule: T): void;

    public abstract addCustomCommandHandler<T extends ECRCommand>(handler: ECRCommandHandler<T>): void;

    public abstract injectCommands(commands: ECRCommand[]): void;

}
