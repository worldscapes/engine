import { NetworkMessage } from "../message";
import { WorldStateSnapshot } from "../../../ecr/ecr/implementations/simple.ecr";

export class UpdatedSnapshotMessage extends NetworkMessage {
  constructor(readonly snapshot: WorldStateSnapshot) {
    super();
  }
}
