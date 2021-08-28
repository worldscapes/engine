import {AssetsManager, Mesh, MeshAssetTask, MeshBuilder, Scene, Sound, TransformNode} from "babylonjs";
import {NoAssetFoundError} from "../error/custom-errors/no-asset-found.error";
import {SystemDescription, SystemInstance} from "../system";
import {ISoundOptions} from "babylonjs/Audio/Interfaces/ISoundOptions";
import {Resolver} from "../../shared/resolver";
import {EngineSystem, EngineSystemImpl} from "../engine/engine.system";

/**
 * @example process.env.PUBLIC_URL + "/assets/mesh/OBJ/"
 */
export type AssetUrl = string;
export type ModelAssetName = string;
export type SoundAssetName = ModelAssetName;
export type AssetName = ModelAssetName;
export type AssetConfig = {
    modelAssets: Record<AssetName, { url: AssetUrl, fileName: string }>,
    audioAssets: Record<AssetName, { url: AssetUrl, fileName: string, options: ISoundOptions }>,
}

export class AssetSystemConfig {
    assetConfig?: AssetConfig = undefined;
}

export class AssetSystemImpl extends SystemInstance<AssetSystemImpl, AssetSystemConfig> {

    readonly AssetRootNodeName = "assets_root";
    assetManager!: AssetsManager;
    modelAssetsRootNode!: TransformNode;

    soundAssets!: Record<AssetName, Sound>;

    engineSystem!: EngineSystemImpl;

    protected async initialize() {
        this.engineSystem = this.provider.getInjectedSystem(EngineSystem);

        this.assetManager = new AssetsManager(this.engineSystem.getBabylonScene());

        await this.loadResources(this.engineSystem.getBabylonScene());
    }

    protected async loadResources(scene: Scene): Promise<void> {
        await this.loadSounds(scene);
        await this.loadModels(scene);
    }

    protected async loadModels(scene: Scene): Promise<void> {
        const {assetConfig} = this.provider.getInjectConfig();
        const tasks = Object.entries(assetConfig.modelAssets).reduce((acc, [key, value]) =>
                ({
                    ...acc,
                    [key]: this.assetManager.addMeshTask(`Load ${key}`, "", value.url, value.fileName)
                }),
            {} as Record<AssetName, MeshAssetTask>,
        );
        await this.assetManager.loadAsync();

        // Configuring assets
        this.modelAssetsRootNode = new TransformNode(this.AssetRootNodeName, scene);
        this.modelAssetsRootNode?.setEnabled(false);
        Object.entries(tasks).forEach(([taskKey, task]) => {
            const taskRootNode = new TransformNode(taskKey, scene);

            // Setting up task meshes
            task.loadedMeshes.forEach(mesh => mesh.setParent(taskRootNode));

            // Configuring task root node
            taskRootNode.setParent(this.modelAssetsRootNode);
            taskRootNode.setEnabled(false);
        })
    }

    protected async loadSounds(scene: Scene): Promise<void> {
        const { audioAssets } = this.provider.getInjectConfig().assetConfig;
        let assetCounter = 0;
        let totalCount = Object.keys(audioAssets).length;

        let resolver = new Resolver<void>();

        this.soundAssets = {};

        Object.entries(audioAssets).forEach(([name, params]) => {
            this.soundAssets[name] = new Sound(
                name,
                params.url + params.fileName,
                scene,
                () => {
                    assetCounter += 1;

                    if (assetCounter === totalCount) {
                        resolver.resolve();
                    }
                },
                params.options
            );
        })

        return resolver.promise;
    }

    createLines = MeshBuilder.CreateLines;

    getSoundAsset(name: AssetName): Sound {

        const soundAsset = this.soundAssets[name];

        if (!soundAsset) {
            throw new Error(`Sound asset with name [${name}] does not exist`);
        }

        return soundAsset;
    }

    provideAsset(assetName: AssetName, newName: string, clone: boolean = false) {

        const asset = this.modelAssetsRootNode?.getChildren(node => node.name == assetName)[0] as TransformNode;
        if (!asset) {
            throw new NoAssetFoundError(assetName);
        }

        const clonedAsset = clone ? this.cloneNode(asset) : this.instantiateNode(asset);
        clonedAsset.name = newName;

        return clonedAsset;
    }

    cloneNode(node: TransformNode): TransformNode {
        const clonedAsset = new TransformNode(node.name, node.getScene());
        node.getChildMeshes().forEach(mesh => {
            const clonedMesh = mesh.clone(mesh.name, clonedAsset);
            clonedMesh?.setEnabled(true);
        });
        clonedAsset.setEnabled(true);
        return clonedAsset;
    }

    instantiateNode(node: TransformNode): TransformNode {
        const clonedAsset = new TransformNode(node.name, node.getScene());
        (node.getChildMeshes() as Mesh[]).forEach(mesh => {

            const clonedMesh = mesh.createInstance(mesh.name);
            clonedMesh.setParent(clonedAsset);
            clonedMesh?.setEnabled(true);
        });
        clonedAsset.setEnabled(true);
        return clonedAsset;
    }
}

export const AssetSystem = new SystemDescription(
    AssetSystemConfig,
    AssetSystemImpl,
    [
        EngineSystem
    ]
);
