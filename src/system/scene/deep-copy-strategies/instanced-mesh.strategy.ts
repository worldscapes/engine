import {AbstractScene, InstancedMesh} from "babylonjs";
import {deepPutIntoContainer} from "./registry";

export function InstancedMeshStrategy(container: AbstractScene, object: InstancedMesh) {
    container.meshes.push(object);

    if (object.actionManager) {
        deepPutIntoContainer(container, object.actionManager);
    }

    object.animations?.forEach(el => deepPutIntoContainer(container, el));
    object.getChildren()?.forEach(el => deepPutIntoContainer(container, el));

    if (object.skeleton) {
        deepPutIntoContainer(container, object.skeleton);
    }
}