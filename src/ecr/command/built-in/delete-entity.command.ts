import {createCommandHandler} from "../command-hander";

export class DeleteEntityCommand {
    constructor(
        readonly entityId: number
    ) {}
}

export const deleteEntityHandler = createCommandHandler(
    DeleteEntityCommand,
    (command, store) => {
        store.deleteEntity(command.entityId);
    }
)