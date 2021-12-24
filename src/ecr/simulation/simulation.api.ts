import {ECRRule} from "../rule/rule";
import {ECRCommand} from "../command/command";
import {ECRCommandHandler} from "../command/command-hander";
import {ECRStore} from "../store/store.api";

export abstract class ECRSimulation {

    public abstract startSimulation(store: ECRStore);

    public abstract addRule(rule: ECRRule);

    public abstract addCustomCommandHandler<T extends ECRCommand>(handler: ECRCommandHandler<T>);

}
