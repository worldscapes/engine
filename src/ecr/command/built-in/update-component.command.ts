import {ECRComponent} from "../../state/component/component";
import {createCommandHandler} from "../command-hander";

export class UpdateComponentCommand<T extends ECRComponent> {
    constructor(
        readonly entityId: number,
        readonly oldComponent: T,
        readonly updatedComponent: T
    ) {}
}

export const updateComponentHandler = createCommandHandler(
    UpdateComponentCommand,
    (command, store) => {
        store.updateComponent(command.entityId, command.oldComponent, command.updatedComponent);
    }
);