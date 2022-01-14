import {ECRSimulationApi} from "./simulation/simulation.api";

export class ECRApi {

    constructor(
        protected simulation: ECRSimulationApi
    ) {}

    readonly runSimulationTick: ECRSimulationApi['runSimulationTick'] = this.simulation.runSimulationTick.bind(this.simulation);
    readonly addRule: ECRSimulationApi['addRule'] = this.simulation.addRule.bind(this.simulation);
    readonly addCustomCommandHandler: ECRSimulationApi['addCustomCommandHandler'] = this.simulation.addCustomCommandHandler.bind(this.simulation);

}