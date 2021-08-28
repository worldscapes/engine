import {AssetContainer, Scene,} from "babylonjs";
import {Entity} from "../../entity/entity";
import {deepPutIntoContainer, SceneContainedData} from "./deep-copy-strategies/registry";
import {getClassName} from "../../shared/get-class-name";

/**
 * @description
 * Object that represents engine scenes.
 *
 * Application can have several engine scenes, but only one babylon Scene.
 * Engine scenes are used to contain and switch resources in babylon Scene.
 */
export class WorldscapesScene {

    protected active: boolean = false;

    protected container!: AssetContainer;

    protected sceneEntities: Entity[] = [];

    constructor(
        readonly sceneName: string,
        protected babylonScene: Scene,
    ) {
        this.container = new AssetContainer(this.babylonScene);
    }

    toggle(newState: boolean = !this.active) {
        if (newState === this.active) {
            return;
        }

        if (newState) {
            this.container.addAllToScene();
        } else {
            this.container.removeAllFromScene();
        }

        this.active = newState;

    }

    addEntity(entity: Entity) {
        this.sceneEntities.push(entity);
    }

    addBabylonObject(object: SceneContainedData)  {
        const copied = deepPutIntoContainer(this.container, object);

        if (!copied) {
            console.warn(`[${getClassName(this)}: ${this.sceneName}]: Could not copy object [${getClassName(object)}] to container. Maybe needed strategy is missing`);
            return;
        }

        if (!this.active) {
            console.log("Removing all from scene");
            console.log(this.container);

            this.container.removeAllFromScene();
        }
    }

    protected getContainer(): Readonly<AssetContainer> {
        return this.container;
    }
}