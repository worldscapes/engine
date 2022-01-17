import {WorldStateSnapshot} from "../ecr/simulation/implementations/simple.simulation";

export type UserInput = any;

export abstract class DisplayApi {

    onInput!: (event: UserInput) => void;

    abstract takeUpdatedSnapshot(snapshot: WorldStateSnapshot): void;

}
