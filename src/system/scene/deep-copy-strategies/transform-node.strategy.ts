import {AbstractScene} from "babylonjs/abstractScene";
import {TransformNode} from "babylonjs";
import {deepPutIntoContainer} from "./registry";

export function TransformNodeStrategy(container: AbstractScene, object: TransformNode) {
    container.transformNodes?.push(object);
    object.animations?.forEach(el => deepPutIntoContainer(container, el));
    object.getChildren()?.forEach(el => deepPutIntoContainer(container, el));
}