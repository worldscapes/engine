import {ECRCommand} from "./command";
import {Constructor} from "../../utility/types/constructor";
import {ECRStore} from "../store/store.api";

export type ECRCommandEffect<T extends ECRCommand> = (command: T, store: ECRStore) => ECRCommand[] | void;

export interface ECRCommandHandler<T extends ECRCommand> {
    commandType: string,
    effect: ECRCommandEffect<T>,
}

export function createCommandHandler<T extends ECRCommand>(
    commandType: Constructor<T>,
    effect: ECRCommandEffect<T>
) {
   return {
       commandType: commandType.name,
       effect: effect
   }
}