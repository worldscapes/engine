import {ECRResource} from "../../state/resource/resource";
import {createCommandHandler} from "../command-hander";

export class AddResourceCommand<T extends ECRResource> {
    constructor(
        readonly resourceName: string,
        readonly resource: T
    ) {
    }
}

export const addResourceHandler = createCommandHandler(
    AddResourceCommand,
    (command, store) => {
        store.addResource(command.resourceName, command.resource);
    }
);