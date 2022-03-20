import { createCommandHandler } from "../command-hander";
import { ECRCommand } from "../command";

export class DeleteEntityCommand extends ECRCommand {
  constructor(readonly entityId: number) {
    super();
  }
}

export const deleteEntityHandler = createCommandHandler(
  DeleteEntityCommand,
  (command, store) => {
    store.deleteEntity(command.entityId);
  }
);
