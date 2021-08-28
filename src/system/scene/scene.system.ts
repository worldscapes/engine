import {SystemDescription, SystemInstance} from "../system";
import {EngineSystem, EngineSystemImpl} from "../engine/engine.system";
import {WorldscapesScene} from "./worldscapes-scene";

export class SceneSystemConfig {}

export type BeforeRenderHook = () => void;

/**
 * Scene system is used to split functionality into virtual scenes
 *
 * Each virtual scene creates container for babylon objects, that can be used to switch them on/off
 * Resources for scene can be loaded in background to then toggle it on
 */
export class SceneSystemImpl extends SystemInstance<SceneSystemImpl, SceneSystemConfig> {

    plainRadius = 300;

    engineSystem!: EngineSystemImpl;

    protected scenes = new Map<string, WorldscapesScene>();

    async initialize() {

        this.engineSystem = this.provider.getInjectedSystem(EngineSystem);

        const engine = this.engineSystem.getEngine();

        // this.setupCamera(this.scene);
    }

    createNewScene(sceneName: string): WorldscapesScene {
        const scene = new WorldscapesScene(sceneName, this.engineSystem.getBabylonScene());
        this.scenes.set(sceneName, scene);
        return scene;
    }

    getSceneByName(sceneName: string): WorldscapesScene | undefined {
        return this.scenes.get(sceneName);
    }

    // protected setupLight(scene: Scene): Scene {
    //     const hemisphericLight = new HemisphericLight('hemisphericLight', new Vector3(0, 1, 0), scene);
    //     hemisphericLight.intensity = 1;
    //
    //     // const directionalLight = new DirectionalLight('directionalLight', new Vector3(15, 5, 15), scene);
    //     // directionalLight.setDirectionToTarget(new Vector3(0, 0, 0));
    //
    //     const pointLight = new PointLight('pointLight', new Vector3(15, 5, 15), scene);
    //     pointLight.setDirectionToTarget(new Vector3(0, 0, 0));
    //
    //     return scene;
    // }
    //
    // protected setupCamera(scene: Scene): Scene {
    //     const camera = new UniversalCamera('camera1', new Vector3(15, 7.5, 15).scale(3), scene);
    //     camera.setTarget(new Vector3(0, 1.5, 0));
    //     camera.attachControl(this.engineSystem.getEngine().getRenderingCanvas());
    //     return scene;
    // }
    //
    // protected setupTestScene(scene: Scene): Scene {
    //     const ground = Mesh.CreateGround('ground1', this.plainRadius * 2, this.plainRadius * 2, 2, scene, false);
    //     ground.visibility = 0;
    //     ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.PlaneImpostor, {mass: 0})
    //     return scene;
    // }

}

export const SceneSystem = new SystemDescription(
    SceneSystemConfig,
    SceneSystemImpl,
    [
        EngineSystem
    ]
);
