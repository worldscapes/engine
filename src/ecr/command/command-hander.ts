import { ECRCommand } from "./command";
import { Constructor } from "../../utility/types/constructor";
import { ECRStore } from "../store/store.api";
import { getTypeName } from "../../typing/WSCStructure";

export namespace ECRCommandEffect {
  export type InferCommandType<T extends ECRCommandEffect> = T extends ECRCommandEffect<infer R> ? R : never;
}
export type ECRCommandEffect<CommandType extends ECRCommand = ECRCommand> = (
  command: CommandType,
  store: ECRStore
) => ECRCommand[] | void;

export interface ECRCommandHandler<EffectType extends ECRCommandEffect = ECRCommandEffect> {
  commandType: string;
  effect: EffectType;
}

export function createCommandHandler<CommandType extends ECRCommand>(
  commandType: Constructor<CommandType>,
  effect: ECRCommandEffect<CommandType>,
): ECRCommandHandler {
  return {
    commandType: getTypeName(commandType),
    effect: effect as ECRCommandEffect,
  };
}
