import {createEntityExtenderInstaller, EntityExtenderInstance} from "../extenders";
import {EntityDestroyEvent} from "../../entity";
import {Mesh, TransformNode, Vector3} from "babylonjs";
import {BehaviorSubject} from "rxjs";
import {AbstractMesh} from "babylonjs/Meshes/abstractMesh";
import {ExtenderEvent, ExtenderReceiverEvent} from "../../event-injection/events";
import {EngineBootstrap} from "../../../bootstrap";
import {EngineSystem} from "../../../system/engine/engine.system";


export class AddChildrenNodeEvent extends ExtenderEvent<{ newChild: TransformNode }> {}

export class EntityRootNodeReceiver extends ExtenderReceiverEvent<{ node: AbstractMesh }> {}


export class AddEntityNodeExtenderInst extends EntityExtenderInstance {

    protected async initialize() {

        const engineSystem = await EngineBootstrap.WorldscapesEngine.getSystem(EngineSystem);

        const state = new BehaviorSubject({
            entityNode: new Mesh(`entity_${this.entityTag}`, engineSystem.getBabylonScene()),
        });

        this.entityScene.addBabylonObject(state.getValue().entityNode);

        this.injector.createSupplier(EntityRootNodeReceiver).supply({ node: state.getValue().entityNode });

        this.injector.subscribe(AddChildrenNodeEvent, event => {
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

    protected initialState(): this["currentState"] {
        return {};
    }
}

export const AddEntityNodeExtender = createEntityExtenderInstaller({
    dependencies: {
        provides: [
            AddChildrenNodeEvent,
            EntityRootNodeReceiver,
        ],
        willSubscribe: [
            AddChildrenNodeEvent,
            EntityRootNodeReceiver,
            EntityDestroyEvent,
        ]
    },
    instanceConstructor: AddEntityNodeExtenderInst,
})