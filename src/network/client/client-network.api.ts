import {WorldStateSnapshot} from "../../ecr/simulation/implementations/simple.simulation";
import {UserAction} from "../../display/display.api";

export abstract class NetworkClientApi {

    constructor() {}

    abstract getLastReceivedSnapshot(): WorldStateSnapshot;
    abstract sendUserActions(input: UserAction[]): void;

}