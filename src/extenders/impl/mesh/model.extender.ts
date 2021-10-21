import {AssetName, AssetSystem} from "../../../system/asset/asset.system";
import {EntityExtenderInstaller, EntityExtenderInstance} from "../../../system/entity/extenders";
import {EngineBootstrap} from "../../../bootstrap";
import {EngineSystem} from "../../../system/engine/engine.system";
import {AddNodeToJointEvent} from "../add-joint-node.extender";

export class AddModelExtenderInst extends EntityExtenderInstance<{ config: { modelTag: string, assetName: AssetName, clone: boolean } }> {

    protected initialState(): this["currentState"] {
        return {};
    }

    protected async initialize() {

        const engineSystem = await EngineBootstrap.WorldscapesEngine.getSystem(EngineSystem);

        // If event provider requires system, all event requesters should wait until this system is provided
        const assetSystem = await EngineBootstrap.WorldscapesEngine.getSystem(AssetSystem);

        if (!assetSystem) {
            throw Error();
        }

        const state = {
            tag: this.getState().config.modelTag,
            assetName: this.getState().config.assetName,
        };

        this.updateState({ num: 1 })
        this.getState();

        const loadedAsset = assetSystem.provideAsset(this.getConfig().assetName, `model_${this.getConfig().modelTag}`);
        this.entityScene.addBabylonObject(loadedAsset);

        this.injector.getDispatcher(AddNodeToJointEvent)?.({
            newChild: loadedAsset,
        });


        /**
         * Accessors can be removed since it was needed only to bind events, that is done now by injectors.
         * Injectors provide access to events, but they additionally check that we access only requested ones.
         * Accessors had nice capability to encapsulate binding and made developer think only about reaction itself
         *
         * They can additionally provide nice capability to interface dependencies
         */
        // return mergeAccessors([
        //   // addChildTransformNodeAccessor(
        //   //   (scene) => {
        //   //     state.node = AssetSystem.provideAsset(scene, assetName, `model_${modelTag}`);
        //   //     return state.node;
        //   //   }
        //   // ),
        //   beforeInitAccessor((registerEventEffect) => {
        //     localScope.registerEventEffect = registerEventEffect;
        //     localScope.registerEventEffect(EntityOnInitEvent.Type, () => {
        //       console.log("Model entity initialized")
        //     });
        //   }),
        //   onDestroyAccessor(() => {
        //   }),
        // ]);
    }
}

export const AddModelExtender = new EntityExtenderInstaller(
    'AddModelExtender',
    AddModelExtenderInst,
    {
        provides: [],
        willDispatch: [
            AddNodeToJointEvent,
        ],
    }
);