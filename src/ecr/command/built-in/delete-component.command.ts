import {ECRComponent} from "../../state/component/component";
import {createCommandHandler} from "../command-hander";
import {ECRCommand} from "../command";

export class DeleteComponentCommand<T extends ECRComponent> extends ECRCommand {
    constructor(
        readonly entityId: number,
        readonly component: T
    ) {
        super();
    }
}

export const deleteComponentHandler = createCommandHandler(
    DeleteComponentCommand,
    (command, store) => {
        store.deleteComponent(command.entityId, command.component);
    }
)