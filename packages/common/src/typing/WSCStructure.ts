import { Constructor } from "../utility/types/constructor";

export abstract class WSCStructure {
  readonly typeChain: string[] = getChainNames(this);
}

function getChainNames(obj: WSCStructure) {
  const chainNames: string[] = [];

  let prototype = Object.getPrototypeOf(obj);
  while (prototype.constructor.name !== WSCStructure.name) {
    chainNames.push(prototype.constructor.name);
    prototype = Object.getPrototypeOf(prototype);
  }

  return chainNames;
}

export function getTypeName<T extends WSCStructure>(
  constructor: Constructor<T>
): string {
  return constructor.name;
}

export function getObjectType<T extends WSCStructure>(obj: T): string {
  return obj.typeChain[0];
}

export function isTypeOf<T extends WSCStructure, R extends T>(
  obj: T,
  type: Constructor<R>
): obj is R {
  return obj.typeChain.includes(type.prototype.constructor.name);
}

export function isSameType<T extends WSCStructure, R extends WSCStructure>(
  obj1: T,
  obj2: R
): boolean {
  return getObjectType(obj1) === getObjectType(obj2);
}
