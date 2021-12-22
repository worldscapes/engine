import {ECRCommand} from "./command";
import {Constructor} from "../../utility/types/constructor";

export type ECRCommandEffect<T extends ECRCommand> = (command: T) => void;

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