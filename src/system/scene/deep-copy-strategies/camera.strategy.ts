import {AbstractScene} from "babylonjs/abstractScene";
import {Camera} from "babylonjs";
import {deepPutIntoContainer, DetailedSceneContainedData} from "./registry";
import {objectIsOfBabylonClass} from "../../../shared/object-is-of-babylon-class";

export function CameraStrategy(container: AbstractScene, object: DetailedSceneContainedData) {
    if (objectIsOfBabylonClass(Camera, object)) {
        container.cameras.push(object);

        object.animations?.forEach(animation => deepPutIntoContainer(container, animation));

        return true;
    }

    return false;
}