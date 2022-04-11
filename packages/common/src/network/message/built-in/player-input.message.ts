import { NetworkMessage } from "../message";
import {PlayerAction} from "../../../ecr/user-action/player-action";

export class PlayerInputMessage extends NetworkMessage {
    constructor(readonly input: PlayerAction[]) {
        super();
    }
}