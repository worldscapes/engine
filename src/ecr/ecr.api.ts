import {ECRStore} from "./store/store.api";
import {SimpleStore} from "./store/implementations/simple.store";
import {ECRSimulation} from "./simulation/simulation.api";
import {SimpleSimulation} from "./simulation/implementations/simple.simulation";

export class ECR {

    constructor(
        protected simulation: ECRSimulation = new SimpleSimulation(),
        protected store: ECRStore = new SimpleStore(),
    ) {}

    readonly startSimulation: () => void = () => { this.simulation.startSimulation(this.store) };
    readonly addRule: ECRSimulation['addRule'] = this.simulation.addRule.bind(this.simulation);
    readonly addCustomCommandHandler: ECRSimulation['addCustomCommandHandler'] = this.simulation.addCustomCommandHandler.bind(this.simulation);

}