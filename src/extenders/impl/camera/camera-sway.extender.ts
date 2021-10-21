import {EntityExtenderInstaller, EntityExtenderInstance} from "../../../system/entity/extenders";
import {Vector3} from "babylonjs";
import {AddSocketPipe, SocketPipeParams} from "./camera-socket.extender";

export class CameraSwayExtenderInst extends EntityExtenderInstance {

    xTiltFactor: number = 1;
    yTiltFactor: number = 1;
    zTiltFactor: number = 1;

    protected initialState(): this["currentState"] {
        return {};
    }

    protected async initialize() {

        this.injector.getDispatcher(AddSocketPipe)({
            priority: -20,
            pipe: this.calculateSway.bind(this),
        });
    }

    protected calculateSway(params: SocketPipeParams) {

            let upVector = params.currentState?.upVector;

            if (params.currentState?.position && params.currentState?.upVector && params.previousState?.position) {

                const previousLocalPosition = params.previousState.position.subtract(params.previousState.focus);
                const currentLocalPosition = params.currentState.position.subtract(params.currentState.focus);

                const changeDirection = currentLocalPosition.subtract(previousLocalPosition);

                const targetDirection = previousLocalPosition.scale(-1);

                const upToTargetProjection = this.getOrthogonalProjection(params.currentState?.upVector, targetDirection);
                const changeToUpProjection = this.getOrthogonalProjection(changeDirection, upToTargetProjection);
                const tiltFactor = new Vector3(
                    changeToUpProjection.x !== 0 ? (Math.abs(changeToUpProjection.x) / 10) ** this.xTiltFactor * Math.sign(changeToUpProjection.x) : 0,
                    changeToUpProjection.y !== 0 ? (Math.abs(changeToUpProjection.y) / 10) ** this.yTiltFactor * Math.sign(changeToUpProjection.y) : 0,
                    changeToUpProjection.z !== 0 ? (Math.abs(changeToUpProjection.z) / 10) ** this.zTiltFactor * Math.sign(changeToUpProjection.z) : 0
                );

                // console.log(upToTargetProjection);
                // console.log(changeToUpProjection);
                // console.log(tiltFactor);
                // console.log(this.getOrthogonalProjection(tiltFactor, params.currentState?.upVector));
                //
                // console.log('------------------------');

                upVector = params.currentState?.upVector.add(this.getOrthogonalProjection(tiltFactor, params.currentState?.upVector));
            }

            return {
                ...params.currentState,
                upVector
            }
    }

    protected getOrthogonalProjection(vector: Vector3, normal: Vector3) {
        normal = normal.normalizeToNew();

        return vector.subtract(
            normal.scale(Vector3.Dot(vector, normal))
        );
    }
}

export const CameraSwayExtender = new EntityExtenderInstaller(
    'CameraSwayExtender',
    CameraSwayExtenderInst,
    {
        provides: [

        ],
        willDispatch: [
            AddSocketPipe
        ]
    }
);