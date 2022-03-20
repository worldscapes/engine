import { ECRComponent } from "../../state/component/component";
import { createCommandHandler } from "../command-hander";
import { ECRCommand } from "../command";

export class AddComponentCommand<T extends ECRComponent> extends ECRCommand {
  constructor(readonly entityId: number, readonly component: T) {
    super();
  }
}

export const addComponentHandler = createCommandHandler(
  AddComponentCommand,
  (command, store) => {
    store.addComponent(command.entityId, command.component);
  }
);
