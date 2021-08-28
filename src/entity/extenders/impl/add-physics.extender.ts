import {createEntityExtenderInstaller, EntityExtenderInstance} from "../extenders";
import {EntityRootNodeReceiver} from "./add-entity-node.extender";
import {PhysicsSystem} from "../../../system/physics/physics.system";
import {PhysicsImpostor} from "babylonjs";
import {EngineBootstrap} from "../../../bootstrap";


export class AddPhysicsExtenderInst extends EntityExtenderInstance {

    protected async initialize() {

        const physicsSystem = await EngineBootstrap.WorldscapesEngine.getSystem(PhysicsSystem);

        if (!physicsSystem) {
            throw Error();
        }

        // Object should not keep internal state of other extender
        // If we need to get internal state of another extender we can execute function in it's context
        await this.injector.receive(
            EntityRootNodeReceiver,
            context => {
                physicsSystem?.addPhysics(context.node, PhysicsImpostor.NoImpostor, {
                    mass: 3,
                    restitution: 3,
                    friction: 0.015
                });
            }
        );
    }

    protected initialState(): this["currentState"] {
        return {};
    }
}

export const AddPhysicsExtender = createEntityExtenderInstaller({
    dependencies: {
        provides: [],
        willDispatch: [
            EntityRootNodeReceiver,
        ],
    },
    instanceConstructor: AddPhysicsExtenderInst,
})