import {AbstractScene, InstancedLinesMesh, InstancedMesh} from "babylonjs";
import {deepPutIntoContainer, DetailedSceneContainedData} from "./registry";
import {objectIsOfBabylonClass} from "../../../shared/object-is-of-babylon-class";

export function InstancedMeshStrategy(container: AbstractScene, object: DetailedSceneContainedData) {
    if (objectIsOfBabylonClass(InstancedMesh, object) || objectIsOfBabylonClass(InstancedLinesMesh, object)) {
        container.meshes.push(object);

        if (object.actionManager) {
            deepPutIntoContainer(container, object.actionManager);
        }

        object.animations?.forEach(el => deepPutIntoContainer(container, el));
        object.getChildren()?.forEach(el => deepPutIntoContainer(container, el));

        if (object.skeleton) {
            deepPutIntoContainer(container, object.skeleton);
        }

        return true;
    }

    return false;
}