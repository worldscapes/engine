import {EntityExtenderInstaller, EntityExtenderInstance} from "../../../system/entity/extenders";
import {DeviceType, PointerInput, Vector3, Plane} from "babylonjs";
import {InputAlias} from "../../../system/input/alias";
import {InputTrigger, InputTriggerTypes} from "../../../system/input/triggers";
import {HoldPressCombinator} from "../../../system/input/combinations/holdpress.combinator";
import {EngineBootstrap} from "../../../bootstrap";
import {InputSystem, InputSystemImpl} from "../../../system/input/input.system";
import {EngineSystem, EngineSystemImpl} from "../../../system/engine/engine.system";
import {AddSocketPipe, SocketState} from "./camera-socket.extender";

export const OrbitMoveHorizontalAlias = new InputAlias(
    "orbitMoveHorizontal",
    [
        InputTriggerTypes.Press,
        InputTriggerTypes.Hold,
    ],
    [
        new HoldPressCombinator(
            new InputTrigger(
                DeviceType.Mouse,
                PointerInput.RightClick,
                InputTriggerTypes.Hold
            ),
            new InputTrigger(
                DeviceType.Mouse,
                PointerInput.DeltaHorizontal,
                InputTriggerTypes.Press
            ),
        )
    ],
);

export const OrbitMoveVerticalAlias = new InputAlias(
    "orbitMoveVertical",
    [
        InputTriggerTypes.Press,
    ],
    [
        new InputTrigger(
            DeviceType.Mouse,
            PointerInput.MouseWheelY,
            InputTriggerTypes.Press
        ),
    ],
);

export class OrbitSocketMovementExtenderInst extends EntityExtenderInstance {

    originalUp = new Vector3(0, 15, 0);

    targetFollowSpeed = 5;

    horizontalSpeed = 0.35;
    verticalSpeed = 0.35;

    minCameraHeight = 10;
    maxCameraHeight = 400;

    minFov = 1.4;
    maxFov = 1;

    minRadius = 20;
    maxRadius = 450;

    currentHorizontalValue: number = 0;
    currentVerticalValue: number = 0.5;

    oldHorizontalValue: number = this.currentHorizontalValue;
    oldVerticalValue: number = this.currentVerticalValue;

    targetHorizontalValue: number = this.currentHorizontalValue;
    targetVerticalValue: number = this.currentVerticalValue;

    focusPoint: Vector3 = new Vector3(0, 1, 0);

    engineSystem!: EngineSystemImpl;
    inputSystem!: InputSystemImpl;

    positions!: SocketState;

    protected initialState(): this["currentState"] {
        return {};
    }

    protected async initialize() {

        this.engineSystem = await EngineBootstrap.WorldscapesEngine.getSystem(EngineSystem);
        this.inputSystem = await EngineBootstrap.WorldscapesEngine.getSystem(InputSystem);

        this.inputSystem.addAliasListener(OrbitMoveHorizontalAlias, inputState => {
            const delta = this.horizontalSpeed * inputState.value / 500;
            this.targetHorizontalValue = this.targetHorizontalValue + delta;
        });


        this.inputSystem.addAliasListener(OrbitMoveVerticalAlias, inputState => {
            const delta = this.verticalSpeed * (this.targetVerticalValue + 0.01) * Math.sign(inputState.value);
            this.targetVerticalValue = Math.min(1, Math.max(this.targetVerticalValue + delta, 0));
        });


        this.injector.getDispatcher(AddSocketPipe)({
            priority: 20,
            pipe: (params) => {
                return this.updatePositions.bind(this)(
                    params.delta,
                    params.currentState,
                    this.oldVerticalValue,
                    this.oldHorizontalValue,
                    this.currentVerticalValue,
                    this.currentHorizontalValue
                );
            }
        });

        let timestamp = Date.now();
        setInterval(
            () => {
                const now = Date.now();
                const delta = (now - timestamp) / 1000;
                timestamp = now;

                const newValues = this.updateCurrentValues(delta);

                this.currentVerticalValue = newValues.verticalValue;
                this.currentHorizontalValue = newValues.horizontalValue;

                // this.updateCameraPositionDispatcher({ position: this.focusPoint.add(this.positions.localPosition) });
                // this.updateCameraFovDispatcher({ fov: this.positions.fov });
                // this.updateCameraUpVectorDispatcher({ up: this.positions.upVector });
            },
        15
        );
    }

    protected updateCurrentValues(delta: number) {
        const mixFactor = Math.max(0, Math.min(1, this.targetFollowSpeed * delta));
        return {
            verticalValue: this.currentVerticalValue * (1 - mixFactor) + this.targetVerticalValue * mixFactor,
            horizontalValue: this.currentHorizontalValue * (1 - mixFactor) + this.targetHorizontalValue * mixFactor
        }
    }

    protected updatePositions(
        delta: number,
        currentState: this['positions'],
        oldVerticalValue: number,
        oldHorizontalValue: number,
        newVerticalValue: number = oldVerticalValue,
        newHorizontalValue: number = oldHorizontalValue
    ): this['positions'] {

        const height = this.calculateHeightByVertical(this.currentVerticalValue, this.minCameraHeight, this.maxCameraHeight);
        const radius = this.calculateRadiusByVertical(this.currentVerticalValue, this.minRadius, this.maxRadius);

        const localPosition = this.calculateLocalPosition(height, radius, this.currentHorizontalValue);
        const fov = this.calculateFov(this.currentVerticalValue, this.minFov, this.maxFov);

        let upVector = this.originalUp;

        return {
            focus: currentState.focus,
            position: currentState.focus.add(localPosition),
            fov,
            upVector
        }
    }

    protected calculateHeightByVertical(verticalValue: number, minHeight: number, maxHeight: number): number {
        return (maxHeight - minHeight) * verticalValue + minHeight;
    }

    protected calculateRadiusByVertical(verticalValue: number, minRadius: number, maxRadius: number): number {
        const radiusSizeFactor = verticalValue ** 0.35;
        return (maxRadius - minRadius) * radiusSizeFactor + minRadius;
    }

    protected calculateLocalPosition(height: number, radius: number, horizontalValue: number): Vector3 {
        const horizontalAngle = 2 * Math.PI * ((horizontalValue + 1) % 1);
        return new Vector3(
            Math.cos(horizontalAngle) * radius,
            height,
            Math.sin(horizontalAngle) * radius,
        );
    }

    protected calculateFov(verticalValue: number, minFov: number, maxFov: number) {
        return (maxFov - minFov) * verticalValue + minFov;
    }

    protected getOrthogonalProjection(vector: Vector3, normal: Vector3) {
        normal = normal.normalizeToNew();

        return vector.subtract(
          normal.scale(Vector3.Dot(vector, normal))
        );
    }
}

export const OrbitSocketMovementExtender = new EntityExtenderInstaller(
    'orbitSocketMovement',
    OrbitSocketMovementExtenderInst,
    {
        provides: [

        ],
        willDispatch: [
            AddSocketPipe
        ]
    }
);