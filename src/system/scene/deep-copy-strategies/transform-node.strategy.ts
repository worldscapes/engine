import {AbstractScene} from "babylonjs/abstractScene";
import {TransformNode} from "babylonjs";
import {deepPutIntoContainer, DetailedSceneContainedData} from "./registry";
import {objectIsOfBabylonClass} from "../../../shared/object-is-of-babylon-class";

export function TransformNodeStrategy(container: AbstractScene, object: DetailedSceneContainedData) {
    if (objectIsOfBabylonClass(TransformNode, object)) {
        console.log("Executing strategy")

        container.transformNodes?.push(object);
        object.animations?.forEach(el => deepPutIntoContainer(container, el));
        object.getChildren()?.forEach(el => deepPutIntoContainer(container, el));

        return true;
    }
    return false
}