import {ECRComponent} from "../../state/component/component";
import {createCommandHandler} from "../command-hander";

export class DeleteComponentCommand<T extends ECRComponent> {
    constructor(
        readonly entityId: number,
        readonly component: T
    ) {}
}

export const deleteComponentHandler = createCommandHandler(
    DeleteComponentCommand,
    (command, store) => {
        store.deleteComponent(command.entityId, command.component);
    }
)