import {WorldStateSnapshot} from "../../ecr/simulation/implementations/simple.simulation";
import {UserInput} from "../../display/display.api";

export abstract class NetworkClientApi {

    constructor() {}

    abstract getLastReceivedSnapshot(): WorldStateSnapshot;
    abstract sendUserInput(input: UserInput): void;

}