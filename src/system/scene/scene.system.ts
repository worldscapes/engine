import {SystemDescription, SystemInstance} from "../system";
import {EngineSystem, EngineSystemImpl} from "../engine/engine.system";
import {EngineSubscene} from "./engine-subscene";

export class SceneSystemConfig {}

export type BeforeRenderHook = () => void;

/**
 * Scene system is used to split functionality into virtual scenes
 *
 * Each virtual scene creates container for babylon objects, that can be used to switch them on/off
 * Resources for scene can be loaded in background to then toggle it on
 */
export class SceneSystemImpl extends SystemInstance<SceneSystemImpl, SceneSystemConfig> {

    protected ENGINE_SUBSCENE_NAME = "engineDefault";

    plainRadius = 300;

    engineSystem!: EngineSystemImpl;

    protected scenes = new Map<string, EngineSubscene>();

    async initialize() {

        this.engineSystem = this.provider.getSystem(EngineSystem);

        const engineSubscene = this.createNewScene(this.ENGINE_SUBSCENE_NAME);
        engineSubscene.toggle(true);
        engineSubscene.toggle = function () {}; // Engine scene will not toggle anymore
        engineSubscene.addBabylonObject(this.engineSystem.getDefaultCamera());
    }

    createNewScene(sceneName: string): EngineSubscene {
        const scene = new EngineSubscene(sceneName, this.engineSystem.getBabylonScene());
        this.scenes.set(sceneName, scene);
        return scene;
    }

    getSceneByName(sceneName: string): EngineSubscene | undefined {
        return this.scenes.get(sceneName);
    }
}

export const SceneSystem = new SystemDescription(
    SceneSystemConfig,
    SceneSystemImpl,
    [
        EngineSystem
    ]
);
