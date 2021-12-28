import {ECRRule} from "../rule/rule";
import {ECRCommand} from "../command/command";
import {ECRCommandHandler} from "../command/command-hander";

export abstract class ECRSimulation {

    public abstract runSimulationTick();

    public abstract addRule(rule: ECRRule);

    public abstract addCustomCommandHandler<T extends ECRCommand>(handler: ECRCommandHandler<T>);

}
