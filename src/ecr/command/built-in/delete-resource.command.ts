import { ECRResource } from "../../state/resource/resource";
import { createCommandHandler } from "../command-hander";
import { ECRCommand } from "../command";

export class DeleteResourceCommand<T extends ECRResource> extends ECRCommand {
  constructor(readonly resourceName: string) {
    super();
  }
}

export const deleteResourceHandler = createCommandHandler(
  DeleteResourceCommand,
  (command, store) => {
    store.deleteResource(command.resourceName);
  }
);
