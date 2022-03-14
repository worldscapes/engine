import { createCommandHandler } from "../command-hander";
import { ECRCommand } from "../command";
import {WorldStateSnapshot} from "../../ecr/implementations/simple.ecr";

export class LoadSnapshotCommand extends ECRCommand {
    constructor(readonly snapshot: WorldStateSnapshot) {
        super();
    }
}

export const loadSnapshotHandler = createCommandHandler(
    LoadSnapshotCommand,
    (command, store) => {
        store.loadSnapshot(command.snapshot);
    }
);
