import {WorldStateSnapshot} from "../ecr/simulation/implementations/simple.simulation";

export abstract class DisplayApi {

    onInput!: (event) => void;

    abstract takeUpdatedSnapshot(snapshot: WorldStateSnapshot): void;

}
