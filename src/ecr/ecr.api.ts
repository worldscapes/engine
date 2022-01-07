import {ECRSimulation} from "./simulation/simulation.api";

export class ECRApi {

    constructor(
        protected simulation: ECRSimulation
    ) {}

    readonly runSimulationTick: ECRSimulation['runSimulationTick'] = this.simulation.runSimulationTick.bind(this.simulation);
    readonly addRule: ECRSimulation['addRule'] = this.simulation.addRule.bind(this.simulation);
    readonly addCustomCommandHandler: ECRSimulation['addCustomCommandHandler'] = this.simulation.addCustomCommandHandler.bind(this.simulation);

}