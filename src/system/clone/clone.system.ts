import {SystemDescription, SystemInstance} from "../system";
import {SubsceneObject} from "../scene/subscene-object";
import {InstancedMesh, Mesh, TransformNode} from "babylonjs";
import {EngineSystem} from "../engine/engine.system";

export class CloneSystemConfig {}

export class CloneSystemImpl extends SystemInstance<CloneSystemImpl, CloneSystemConfig> {

    protected async initialize() {}

    cloneNode<T extends TransformNode>(cloneName: string, objectToClone: SubsceneObject<T>): SubsceneObject<T> {
        return objectToClone.subscene.addBabylonObject(
            objectToClone.object.clone(cloneName, null) as T
        );
    }

    instantiateNode<T extends Mesh>(instanceName: string, objectToInstantiate: SubsceneObject<T>): SubsceneObject<InstancedMesh> {
        return objectToInstantiate.subscene.addBabylonObject(
            objectToInstantiate.object.createInstance(instanceName) as InstancedMesh
        );
    }
}


export const CloneSystem = new SystemDescription(
    CloneSystemConfig,
    CloneSystemImpl,
    [
        EngineSystem // Imported since Clone is impossible without Babylon
    ],
);