import {ECRResource} from "../../state/resource/resource";
import {createCommandHandler} from "../command-hander";
import {ECRCommand} from "../command";

export class UpdateResourceCommand<T extends ECRResource> extends ECRCommand {
    constructor(
        readonly resourceName: string,
        readonly updatedResource: T
    ) {
        super();
    }
}

export const updateResourceHandler = createCommandHandler(
    UpdateResourceCommand,
    (command, store) => {
        store.updateResource(command.resourceName, command.updatedResource);
    },
);