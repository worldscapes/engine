import { WorldStateSnapshot } from "../ecr/simulation/implementations/simple.simulation";
import { WSCStructure } from "../typing/WSCStructure";

export abstract class UserAction extends WSCStructure {}

export abstract class DisplayApi {
  onInput?: (event: UserAction) => void;
  takeUpdatedSnapshot?(snapshot: WorldStateSnapshot): void;
}
