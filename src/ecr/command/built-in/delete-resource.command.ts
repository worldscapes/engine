import {ECRResource} from "../../state/resource/resource";
import {createCommandHandler} from "../command-hander";

export class DeleteResourceCommand<T extends ECRResource> {
    constructor(
        readonly resourceName: string
    ) {
    }
}

export const deleteResourceHandler = createCommandHandler(
    DeleteResourceCommand,
    (command, store) => {
        store.deleteResource(command.resourceName);
    }
);
