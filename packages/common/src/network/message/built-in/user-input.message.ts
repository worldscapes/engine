import { NetworkMessage } from "../message";
import {UserAction} from "../../../ecr/user-action/user-action";

export class UserInputMessage extends NetworkMessage {
    constructor(readonly input: UserAction[]) {
        super();
    }
}