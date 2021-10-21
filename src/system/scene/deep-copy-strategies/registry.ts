import {TransformNodeStrategy} from "./transform-node.strategy";
import {CameraStrategy} from "./camera.strategy";
import {
    AbstractActionManager,
    Animation,
    AnimationGroup,
    BaseTexture,
    Camera,
    EffectLayer,
    Geometry,
    InstancedMesh,
    Layer,
    LensFlareSystem,
    Light,
    Material,
    Mesh,
    MorphTargetManager,
    MultiMaterial,
    Node,
    ParticleSystem,
    PostProcess,
    PrePassRenderer,
    ProceduralTexture,
    ReflectionProbe,
    Scene,
    Skeleton,
    Sound,
    TransformNode
} from "babylonjs";
import {AbstractMesh} from "babylonjs/Meshes/abstractMesh";
import {AbstractScene} from "babylonjs/abstractScene";

import {MeshStrategy} from "./mesh.strategy";
import {InstancedMeshStrategy} from "./instanced-mesh.strategy";
import SubSurfaceConfiguration = BABYLON.SubSurfaceConfiguration;
import {objectIsOfBabylonClass} from "../../../shared/functions/object-is-of-babylon-class";

export type SceneContainedData =
    AbstractActionManager |
    AnimationGroup |
    Animation |
    Camera |
    EffectLayer |
    Geometry |
    Layer |
    LensFlareSystem |
    Light |
    Material |
    AbstractMesh |
    MorphTargetManager |
    MultiMaterial |
    ParticleSystem |
    PostProcess |
    PrePassRenderer |
    ProceduralTexture |
    ReflectionProbe |
    Node |
    Scene |
    Skeleton |
    Sound |
    SubSurfaceConfiguration |
    BaseTexture |
    TransformNode;

export type DetailedSceneContainedData = SceneContainedData;

type StrategiesRegistry<T extends DetailedSceneContainedData> = { type: new (...args) => DetailedSceneContainedData, strategy: (container: AbstractScene, object: T) => void }[];

/**
 * More general strategies must be lower to not execute before inherited ones
 */
export const deepCopyStrategies: StrategiesRegistry<any> = [
    {
        type: InstancedMesh,
        strategy: InstancedMeshStrategy,
    },
    {
        type: Mesh,
        strategy: MeshStrategy,
    },
    {
        type: Camera,
        strategy: CameraStrategy,
    },
    {
        type: TransformNode,
        strategy: TransformNodeStrategy,
    },
];

export function deepPutIntoContainer(container: AbstractScene, object: DetailedSceneContainedData) {
    return deepCopyStrategies.reduce(
        (acc: boolean, {type, strategy }) => {
            if (!acc && objectIsOfBabylonClass(type, object)) {
                strategy(container, object);
                return true;
            } else {
                return acc;
            }
        },
        false,
    )
}