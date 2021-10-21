import {EngineView} from "babylonjs/Engines/Extensions/engine.views";
import {Camera} from "babylonjs";

/**
 * Can be used to select which camera is rendered to given EngineView
 */
export class CameraView {

    constructor(
        readonly name: string,
        readonly view: EngineView
    ) {
    }

    useCamera(camera: Camera) {

    }

}