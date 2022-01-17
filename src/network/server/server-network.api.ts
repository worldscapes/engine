import {WorldStateSnapshot} from "../../ecr/simulation/implementations/simple.simulation";
import {UserInput} from "../../display/display.api";

export abstract class NetworkServerApi {

    constructor() {}

    abstract sendSnapshot(snapshot: WorldStateSnapshot);
    abstract getUserInput(): Record<string, UserInput[]>;

}