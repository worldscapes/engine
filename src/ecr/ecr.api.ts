import {ECRSimulation} from "./simulation/simulation.api";
import {SimpleSimulation} from "./simulation/implementations/simple.simulation";

export class ECR {

    constructor(
        protected simulation: ECRSimulation = new SimpleSimulation(),
    ) {}

    readonly runSimulationTick: () => void = () => { this.simulation.runSimulationTick() };
    readonly addRule: ECRSimulation['addRule'] = this.simulation.addRule.bind(this.simulation);
    readonly addCustomCommandHandler: ECRSimulation['addCustomCommandHandler'] = this.simulation.addCustomCommandHandler.bind(this.simulation);

}