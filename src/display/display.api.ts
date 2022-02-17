import { WorldStateSnapshot } from "../ecr/ecr/implementations/simple.ecr";
import { WSCStructure } from "../typing/WSCStructure";

export abstract class UserAction extends WSCStructure {}

export abstract class DisplayApi {
  onInput?: (event: UserAction) => void;
  takeUpdatedSnapshot?(snapshot: WorldStateSnapshot): void;
}
