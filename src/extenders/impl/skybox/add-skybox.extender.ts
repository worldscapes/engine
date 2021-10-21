import {EntityExtenderInstaller, EntityExtenderInstance} from "../../../system/entity/extenders";
import {Color3, CubeTexture, MeshBuilder, StandardMaterial, Texture, Vector3} from "babylonjs";
import {EngineBootstrap} from "../../../bootstrap";
import {EngineSystem} from "../../../system/engine/engine.system";

export class AddSkyboxExtenderInst extends EntityExtenderInstance<{ config: { skyboxPath: string } }> {

    protected initialState(): this["currentState"] {
        return {};
    }

    protected async initialize() {
        const engineSystem = await EngineBootstrap.WorldscapesEngine.getSystem(EngineSystem);

        const skybox = MeshBuilder.CreateBox("skyBox", { size: 10000.0 }, engineSystem.getBabylonScene());
        const skyboxMaterial = new StandardMaterial("skyMaterial", engineSystem.getBabylonScene());
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new CubeTexture(this.getConfig().skyboxPath, engineSystem.getBabylonScene());
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
        skybox.isPickable = false;

        this.entityScene.addBabylonObject(skybox);

        let lastUpdate = Date.now();
        setInterval(
            () => {
                const previousUpdate = lastUpdate;
                lastUpdate = Date.now();
                const deltaChangeFactor = (previousUpdate - lastUpdate) / 1000;

                skybox.rotate(new Vector3(0, 1, 0), 0.005 * deltaChangeFactor);
            },
            15
        );

        // Works, but causes problem on subscene disable
        // engineSystem.getBabylonScene().autoClear = false;
    }
}

export const AddSkyboxExtender = new EntityExtenderInstaller(
    'AddSkyboxExtender',
    AddSkyboxExtenderInst,
    {
        provides: [],
        willDispatch: [],
    }
);