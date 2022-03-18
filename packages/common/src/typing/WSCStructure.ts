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

export function getObjectType<T extends WSCStructure>(object: T): string {
  return object.typeChain[0];
}

export function isTypeOf<T extends WSCStructure>(
  object: T,
  type: Constructor<T>
): boolean {
  return object.typeChain.includes(type.prototype.constructor.name);
}

export function isSameType<T extends WSCStructure, R extends WSCStructure>(
  obj1: T,
  obj2: R
): boolean {
  return getObjectType(obj1) === getObjectType(obj2);
}
