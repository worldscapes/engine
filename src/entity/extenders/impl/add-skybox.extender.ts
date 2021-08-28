import {createEntityExtenderInstaller, EntityExtenderInstance,} from "../extenders";
import {Color3, CubeTexture, MeshBuilder, StandardMaterial, Texture} from "babylonjs";
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
    }
}

export const AddSkyboxExtender = createEntityExtenderInstaller({
    dependencies: {
        provides: [],
        willDispatch: [
        ],
    },
    instanceConstructor: AddSkyboxExtenderInst
});