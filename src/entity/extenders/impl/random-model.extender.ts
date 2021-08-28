import {AssetName, AssetSystem} from "../../../system/asset/asset.system";
import {AddChildrenNodeEvent, EntityRootNodeReceiver} from "./add-entity-node.extender";
import {getRandomElement} from "../../../shared/get-random-element";
import {createEntityExtenderInstaller, EntityExtenderInstance} from "../extenders";
import {EngineBootstrap} from "../../../bootstrap";

export class AddRandomModelExtenderInst extends EntityExtenderInstance<{ config: { modelTag: string, assetNames: AssetName[] } }> {

    protected initialState(): this["currentState"] {
        return {};
    }

    protected async initialize() {
        const assetSystem = await EngineBootstrap.WorldscapesEngine.getSystem(AssetSystem);

        if (!assetSystem) {
            throw Error();
        }

        const state = {
            tag: this.getConfig().modelTag,
            assetNames: this.getConfig().assetNames,
        };

        const addChildNodeDispatcher = this.injector.getDispatcher(AddChildrenNodeEvent);

        await this.injector.receive(
            EntityRootNodeReceiver,
            (context) => {
                const loadedAsset = assetSystem.provideAsset(getRandomElement(this.getConfig().assetNames), `model_${this.getConfig().modelTag}`);
                addChildNodeDispatcher({
                    newChild: loadedAsset,
                });
            }
        );
    }
}

export const AddRandomModelExtender = createEntityExtenderInstaller({
    dependencies: {
        provides: [],
            willDispatch: [
            EntityRootNodeReceiver,
            AddChildrenNodeEvent,
        ],
    },
    instanceConstructor: AddRandomModelExtenderInst,
})