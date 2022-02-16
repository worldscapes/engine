import { ECRComponent } from "../../state/component/component";
import { createCommandHandler } from "../command-hander";
import { ECRCommand } from "../command";

export class UpdateComponentCommand<T extends ECRComponent> extends ECRCommand {
  constructor(
    readonly entityId: number,
    readonly oldComponent: T,
    readonly updatedComponent: T
  ) {
    super();
  }
}

export const updateComponentHandler = createCommandHandler(
  UpdateComponentCommand,
  (command, store) => {
    store.updateComponent(
      command.entityId,
      command.oldComponent,
      command.updatedComponent
    );
  }
);
