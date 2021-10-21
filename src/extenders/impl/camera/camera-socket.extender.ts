import {EntityExtenderInstaller, EntityExtenderInstance} from "../../../system/entity/extenders";
import {EngineBootstrap} from "../../../bootstrap";
import {CameraSystem, CameraSystemImpl} from "../../../system/camera/camera.system";
import {ExtenderEvent} from "../../../system/entity/event-injection/events";
import {EngineSystem, EngineSystemImpl} from "../../../system/engine/engine.system";
import {Vector3, DeepImmutable} from "babylonjs";
import {getClassName} from "../../../shared/functions/get-class-name";
import {CameraSocket} from "../../../system/camera/camera-socket";
import {CameraHolder} from "../../../system/camera/camera-holder";

export class AddSocketPipe extends ExtenderEvent<{ pipe: SocketPipe, priority: number }> {}
export class AttachHolder  extends ExtenderEvent<{ holder: CameraHolder }> {}

export interface SocketState {
    focus: Vector3,
    position: Vector3,
    fov: number,
    upVector: Vector3
}

export type SocketPipeParams = { delta: number } & SocketPipeCache;
export type SocketPipe = (params: SocketPipeParams) => SocketState;

class SocketPipeCache {

    public previousState?: SocketState;
    public currentState: SocketState;
    public lastOutput?: SocketState;

    constructor(currentState: SocketState) {
        this.currentState = currentState;
    }
}

/**
 * SocketExtender pipeline:
 * OnFrame => Pass current state to pipeline => Pipes process state one by one => Apply state to camera
 */
export class AddCameraSocketExtenderInst extends EntityExtenderInstance {

    engineSystem!: EngineSystemImpl;
    cameraSystem!: CameraSystemImpl;

    socket!: CameraSocket;

    pipes: { priority: number, pipe: SocketPipe }[] = [];
    pipeCacheMap = new Map<SocketPipe, SocketPipeCache>();

    readonly initialSocketState: DeepImmutable<SocketState> = {
        focus: Vector3.Zero().clone(),
        position: Vector3.Zero().clone(),
        fov: 0.8,
        upVector: Vector3.Up(),
    };

    previousSocketState: SocketState = this.initialSocketState;
    currentSocketState: SocketState = this.initialSocketState;

    protected initialState(): this["currentState"] {
        return {};
    }

    protected async initialize() {

        this.engineSystem = await EngineBootstrap.WorldscapesEngine.getSystem(EngineSystem);
        this.cameraSystem = await EngineBootstrap.WorldscapesEngine.getSystem(CameraSystem);

        this.socket = this.cameraSystem.createCameraSocket(`cameraSocket_${this.extenderTag}`, this.entityScene);

        this.injector.subscribe(AttachHolder, event => {
            event.body.holder.attachToSocket(this.socket);
        });

        this.injector.subscribe(AddSocketPipe, event => {
            this.addSocketPipe(event.body.pipe, event.body.priority);
        });

        let lastUpdateTime = Date.now();
        setInterval(
            () => {
                const timestamp = Date.now();
                const delta = timestamp - lastUpdateTime;
                lastUpdateTime = timestamp;

                const currentBuffered = this.currentSocketState;

                console.log('----------------');

                this.currentSocketState = this.pipes.reduce(
                    (acc, { priority, pipe }) => {

                        let cache = this.pipeCacheMap.get(pipe) ?? new SocketPipeCache(acc);

                        cache.previousState = cache.currentState;
                        cache.currentState = acc;

                        const pipeInput = {
                            delta: delta,
                            ...cache
                        };

                        cache.lastOutput = pipe(pipeInput);

                        console.log(cache.lastOutput);

                        this.pipeCacheMap.set(pipe, cache);

                        return cache.lastOutput;
                    },
                    this.currentSocketState
                )

                this.previousSocketState = currentBuffered;

                this.applyCurrentSocketState(this.currentSocketState);
            },
            15
        )
    }

    addSocketPipe(pipe: SocketPipe, priority: number) {

        // Check that pipe is not in chain yet
        const alreadyAdded = this.pipes.map(el => el.pipe).includes(pipe);
        if (alreadyAdded) {
            console.error(`[${getClassName(this)}]: Trying to add CameraSocket pipe that has already been included in pipeline`);
        }

        this.pipes.push({ priority: priority, pipe: pipe });

        this.pipes.sort((el1, el2) => el2.priority - el1.priority)
    }

    applyCurrentSocketState(state: SocketState) {
        this.socket.setCurrentPosition(state.position);
        this.socket.setCurrentFocus(state.focus);
        this.socket.setCurrentFov(state.fov);
        this.socket.setCurrentUpVector(state.upVector);
    }
}

export const AddCameraSocketExtender = new EntityExtenderInstaller(
    'AddCameraSocket',
    AddCameraSocketExtenderInst,
    {
        provides: [
            AddSocketPipe,
            AttachHolder,
        ],
        willSubscribe: [
            AddSocketPipe,
            AttachHolder,
        ]
    }
);