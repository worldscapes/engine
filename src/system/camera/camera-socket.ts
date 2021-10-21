import {Vector3} from "babylonjs";
import {ReplaySubject} from "rxjs";
import {map} from "rxjs/operators";

/**
 * Used for manipulating different angles on object
 *
 * Allows to define:
 *  - camera position
 *  - camera direction
 *  - camera post processes
 *
 * Socket can interpolate those things to target values creating nice cinematographic effects
 *
 * Cameras should synchronize values with camera socket automatically
 *
 */
export class CameraSocket {

    currentFocus = new Vector3(0, 1, 0);
    currentPosition = new Vector3(0, 1, 0)
    currentFov = 0.8;
    currentUpVector = new Vector3(0, 1, 0);

    protected focusSub$ = new ReplaySubject<Vector3>(1);
    protected positionSub$ = new ReplaySubject<Vector3>(1);
    protected fovSub$ = new ReplaySubject<number>(1);
    protected upVectorSub$ = new ReplaySubject<Vector3>(1);

    constructor(
        readonly name: string
    ) {
        this.focusSub$.next(this.currentFocus);
        this.fovSub$.next(this.currentFov);
        this.positionSub$.next(this.currentPosition);
    }

    setCurrentFocus(focus: Vector3) {
        this.currentFocus = focus;
        this.focusSub$.next(focus);
    }
    setCurrentFov(fov: number) {
        this.currentFov = fov;
        this.fovSub$.next(fov);
    }
    setCurrentPosition(position: Vector3) {
        this.currentPosition = position;
        this.positionSub$.next(position);
    }
    setCurrentUpVector(upVector: Vector3) {
        this.currentUpVector = upVector;
        this.upVectorSub$.next(upVector);
    }

    getCurrentFocusObservable() {
        return this.focusSub$.pipe(
            map(focus => focus.clone())
        );
    }
    getCurrentPositionObservable() {
        return this.positionSub$.pipe(
            map(position => position.clone())
        );
    }
    getCurrentFovObservable() {
        return this.fovSub$.pipe();
    }
    getCurrentUpVectorObservable() {
        return this.upVectorSub$.pipe(
            map(position => position.clone())
        );
    }


    getCurrentFocus() {
        return this.currentFocus;
    }
    getCurrentPosition() {
        return this.currentPosition;
    }
    getCurrentFov() {
        return this.currentFov;
    }
    getCurrentUpVector() {
        return this.currentUpVector;
    }


}
