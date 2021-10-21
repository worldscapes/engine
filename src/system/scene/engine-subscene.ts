import {AssetContainer, Scene,} from "babylonjs";
import {deepPutIntoContainer, SceneContainedData} from "./deep-copy-strategies/registry";
import {getClassName} from "../../shared/functions/get-class-name";
import {SubsceneObject} from "./subscene-object";

/**
 * @description
 * Object that represents engine scenes.
 *
 * Application can have several engine scenes, but only one babylon Scene.
 * Subscenes are used to contain and switch resources in babylon Scene.
 */
export class EngineSubscene {

    protected active: boolean = false;

    protected container!: AssetContainer;

    constructor(
        readonly sceneName: string,
        protected babylonScene: Scene,
    ) {
        this.container = new AssetContainer(this.babylonScene);
    }

    isActive() {
        return this.active;
    }

    toggle(newState: boolean = !this.active) {
        if (newState === this.active) {
            return;
        }

        this.active = newState;

        if (newState) {
            this.container.addAllToScene();
        } else {
            this.container.removeAllFromScene();
        }
    }

    addBabylonObject<T extends SceneContainedData>(object: T): SubsceneObject<T>  {
        const copied = deepPutIntoContainer(this.container, object);

        if (!copied) {
            throw Error(`[${getClassName(this)}: ${this.sceneName}]: Could not copy object [${getClassName(object)}] to container. Maybe needed strategy is missing`);
        }

        if (!this.active) {
            console.log("Removing all from scene");

            this.container.removeAllFromScene();
        }

        return new SubsceneObject<T>(this, object);
    }

    protected getContainer(): Readonly<AssetContainer> {
        return this.container;
    }
}