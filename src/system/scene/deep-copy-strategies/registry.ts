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
    Layer,
    LensFlareSystem,
    Light,
    Material,
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

/**
 * More general strategies must be lower to not override more specialized ones
 */
export const deepCopyStrategies: (typeof deepPutIntoContainer)[] = [
    InstancedMeshStrategy,
    MeshStrategy,
    CameraStrategy,
    TransformNodeStrategy,
];

export function deepPutIntoContainer(container: AbstractScene, object: DetailedSceneContainedData): boolean {
    return deepCopyStrategies.reduce(
        (acc: boolean, strategy: typeof deepPutIntoContainer) => {
            if (!acc) {
                return strategy(container, object)
            } else {
                return acc;
            }
        },
        false,
    )
}