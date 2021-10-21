import {Vector3} from "babylonjs";
import {CameraSocket} from "./camera-socket";
import {combineLatest, Subscription} from "rxjs";
import { tap } from "rxjs/operators";
import {TargetCamera} from "babylonjs/Cameras/targetCamera";


/**
 * Wraps camera and holds information about it
 *
 * If attached to socket, should synchronize camera state with what is given in socket
 */
export class CameraHolder {

    positionSubscription!: Subscription;
    focusSubscription!: Subscription;

    constructor(
       readonly camera: TargetCamera
    ) {}

    /**
     * Attaches camera to given socket
     * @param socket
     */
    attachToSocket(socket: CameraSocket) {
        console.log("Attaching to socket")

        this.positionSubscription?.unsubscribe();
        this.focusSubscription?.unsubscribe();

        this.positionSubscription = combineLatest([
            socket.getCurrentPositionObservable(),
            socket.getCurrentFocusObservable(),
            socket.getCurrentFovObservable(),
            socket.getCurrentUpVectorObservable(),
        ])
            .pipe(
                tap(([position, focus, fov, up]) => {
                    this.updateFov(fov);
                    this.updatePosition(position);
                    this.updateUpVector(up);
                    this.updateFocus(focus); // Focus should be updated after every position update
                })
            )
            .subscribe();
    }

    /**
     * Update rotation of held camera
     * @param focus Point that camera will be directed to
     * @protected
     */
    protected updateFocus(focus: Vector3) {
        this.camera.target = focus;
    }


    protected updateFov(fov: number) {
        this.camera.fov = fov;
    }

    /**
     * Update position of held camera
     * @param position
     * @protected
     */
    protected updatePosition(position: Vector3) {
        this.camera.position = position;
    }

    protected updateUpVector(up: Vector3) {
        this.camera.upVector = up;
    }
}