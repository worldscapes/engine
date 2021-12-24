import {ECRComponent} from "../../state/component/component";
import {createCommandHandler} from "../command-hander";
import {AddComponentCommand} from "./add-component.command";

export class CreateEntityCommand {
    constructor(
        readonly components: ECRComponent[] = [],
    ) {}
}

export const createEntityHandler = createCommandHandler(
    CreateEntityCommand,
    (command, store) => {
        const entityId = store.createEntity();
        return command.components.map(component => new AddComponentCommand(entityId, component));
    }
)