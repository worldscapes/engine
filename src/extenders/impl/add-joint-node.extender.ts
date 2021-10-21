import {EntityExtenderInstaller, EntityExtenderInstance} from "../../system/entity/extenders";
import {EntityDestroyEvent} from "../../system/entity/entity";
import {Mesh, TransformNode, Vector3} from "babylonjs";
import {BehaviorSubject} from "rxjs";
import {ExtenderEvent} from "../../system/entity/event-injection/events";
import {EngineBootstrap} from "../../bootstrap";
import {EngineSystem} from "../../system/engine/engine.system";

export class AddNodeToJointEvent extends ExtenderEvent<{ newChild: TransformNode }> {}

export class AddJointNodeExtenderInst extends EntityExtenderInstance {


    protected initialState(): this["currentState"] {
        return {};
    }

    protected async initialize() {

        const engineSystem = await EngineBootstrap.WorldscapesEngine.getSystem(EngineSystem);

        const state = new BehaviorSubject({
            entityNode: new Mesh(`entity_${this.entityTag}`, engineSystem.getBabylonScene()),
        });

        this.entityScene.addBabylonObject(state.getValue().entityNode);

        this.injector.subscribe(AddNodeToJointEvent, event => {
            this.addChildToNode(state.getValue().entityNode, event.body.newChild);
        });
        this.injector.subscribe(EntityDestroyEvent, () => {
            state?.getValue().entityNode?.dispose();
        });
    }

    addChildToNode(parent: TransformNode, child: TransformNode) {
        child.setParent(parent);
        child.position = Vector3.Zero();
    }
}

export const AddJointNodeExtender = new EntityExtenderInstaller(
    'AddEntityNode',
    AddJointNodeExtenderInst,
    {
        provides: [
            AddNodeToJointEvent,
        ],
        willSubscribe: [
            AddNodeToJointEvent,
            EntityDestroyEvent,
        ]
    }
);