import {ECRCommand} from "./command";
import {Constructor} from "../../utility/types/constructor";
import {ECRStore} from "../store/store.api";
import {getTypeName} from "../../typing/WSCStructure";

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
       commandType: getTypeName(commandType),
       effect: effect
   }
}