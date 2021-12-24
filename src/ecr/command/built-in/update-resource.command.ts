import {ECRResource} from "../../state/resource/resource";
import {createCommandHandler} from "../command-hander";

export class UpdateResourceCommand<T extends ECRResource> {
    constructor(
        readonly resourceName: string,
        readonly updatedResource: T
    ) {
    }
}

export const updateResourceHandler = createCommandHandler(
    UpdateResourceCommand,
    (command, store) => {
        store.updateResource(command.resourceName, command.updatedResource);
    },
);