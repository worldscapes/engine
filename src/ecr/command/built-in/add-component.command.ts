import {ECRComponent} from "../../state/component/component";
import {createCommandHandler} from "../command-hander";

export class AddComponentCommand<T extends ECRComponent> {
    constructor(
        readonly entityId: number,
        readonly component: T
    ) {}
}

export const addComponentHandler = createCommandHandler(
    AddComponentCommand,
    (command, store) => {
        store.addComponent(command.entityId, command.component);
    }
)