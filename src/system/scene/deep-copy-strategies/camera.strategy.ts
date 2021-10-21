import {AbstractScene} from "babylonjs/abstractScene";
import {Camera} from "babylonjs";
import {deepPutIntoContainer} from "./registry";

export function CameraStrategy(container: AbstractScene, object: Camera) {
    container.cameras.push(object);

    object.animations?.forEach(animation => deepPutIntoContainer(container, animation));
}