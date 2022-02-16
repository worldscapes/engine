import { ECRResource } from "../../state/resource/resource";
import { createCommandHandler } from "../command-hander";
import { ECRCommand } from "../command";

export class AddResourceCommand<T extends ECRResource> extends ECRCommand {
  constructor(readonly resourceName: string, readonly resource: T) {
    super();
  }
}

export const addResourceHandler = createCommandHandler(
  AddResourceCommand,
  (command, store) => {
    store.addResource(command.resourceName, command.resource);
  }
);
