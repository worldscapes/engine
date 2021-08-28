import {Vector3} from "babylonjs";
import {EntityRootNodeReceiver} from "./add-entity-node.extender";
import {ExtenderEvent} from "../../event-injection/events";
import {createEntityExtenderInstaller, EntityExtenderInstance} from "../extenders";

export class SetAbsolutePositionEvent extends ExtenderEvent<{ updated: Vector3 }> {}

export class AddPositionExtenderInst extends EntityExtenderInstance {

    protected initialState(): this["currentState"] {
        return {};
    }

    protected async initialize() {
        this.injector.subscribe(
            SetAbsolutePositionEvent,
            event => {
                this.injector.receive(EntityRootNodeReceiver, (context) => {
                    context.node.position = event.body.updated;
                })
            }
        );
    }
}

export const AddPositionExtender = createEntityExtenderInstaller({
    dependencies: {
        provides: [
            SetAbsolutePositionEvent,
        ],
        willDispatch: [
            EntityRootNodeReceiver,
        ],
        willSubscribe: [
            SetAbsolutePositionEvent,
        ],
    },
    instanceConstructor: AddPositionExtenderInst
})