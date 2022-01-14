import {ECRRule} from "../rule/rule";
import {ECRCommand} from "../command/command";
import {ECRCommandHandler} from "../command/command-hander";
import {WorldStateSnapshot} from "./implementations/simple.simulation";

export abstract class ECRSimulationApi {

    public abstract loadSnapshot(snapshot: WorldStateSnapshot): void;

    public abstract runSimulationTick(): { snapshot: WorldStateSnapshot, commands: ECRCommand[] };

    public abstract addRule(rule: ECRRule): void;

    public abstract addCustomCommandHandler<T extends ECRCommand>(handler: ECRCommandHandler<T>): void;

}
