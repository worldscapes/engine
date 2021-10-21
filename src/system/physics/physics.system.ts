import * as cannon from "cannon";
import {CannonJSPlugin, PhysicsImpostor, PhysicsImpostorParameters, Vector3} from "babylonjs";
import {AbstractMesh} from "babylonjs/Meshes/abstractMesh";
import {MeshHasNoPhysicsError} from "./errors/mesh-has-no-physics.error";
import {SystemDescription, SystemInstance} from "../system";
import {EngineSystem, EngineSystemImpl} from "../engine/engine.system";

export class PhysicsSystemConfig {

}

/**
 * System that activates physics in Babylon.js and can manage physics on Babylon objects
 */
export class PhysicsSystemImpl extends SystemInstance<PhysicsSystemImpl, PhysicsSystemConfig> {

    engineSystem!: EngineSystemImpl;

    protected async initialize() {
        this.engineSystem = this.provider.getSystem(EngineSystem);

        const gravityVector = new Vector3(0, -9.81, 0);
        const physicsPlugin = new CannonJSPlugin(true, 10, cannon);

        this.engineSystem.getBabylonScene().enablePhysics(gravityVector, physicsPlugin);
    }

    addPhysics(mesh: AbstractMesh, impostorType: number, options: PhysicsImpostorParameters) {
        mesh.physicsImpostor = new PhysicsImpostor(mesh, impostorType, options);
    }

    applyImpulse(mesh: AbstractMesh, force: Vector3, contactPoint?: Vector3) {
        const physicsImpostor = mesh.physicsImpostor;

        if (!physicsImpostor) {
            throw new MeshHasNoPhysicsError();
        }

        physicsImpostor.applyImpulse(force, contactPoint ? contactPoint : mesh.getAbsolutePosition());
    }
}

export const PhysicsSystem = new SystemDescription(
    PhysicsSystemConfig,
    PhysicsSystemImpl,
    [
        EngineSystem
    ]
)