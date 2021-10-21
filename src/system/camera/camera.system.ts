import {SystemDescription, SystemInstance} from "../system";
import {EngineSystem, EngineSystemImpl} from "../engine/engine.system";
import {getClassName} from "../../shared/functions/get-class-name";
import {CameraSocket} from "./camera-socket";
import {EngineSubscene} from "../scene/engine-subscene";
import { CameraHolder } from "./camera-holder";
import {CameraView} from "./camera-view";

export class CameraSystemConfig {}

export class CameraSystemImpl extends SystemInstance<CameraSystemImpl, CameraSystemConfig> {

    readonly DEFAULT_CAMERA_HOLDER_NAME = 'defaultEngineCameraHolder';

    holders: Record<string, CameraHolder> = {};
    sockets: Record<string, CameraSocket> = {};
    view: Record<string, CameraView> = {};

    engineSystem!: EngineSystemImpl;

    protected async initialize() {
        this.engineSystem = this.provider.getSystem(EngineSystem);

        this.holders[this.DEFAULT_CAMERA_HOLDER_NAME] = new CameraHolder(this.engineSystem.getDefaultCamera());
    }

    getCameraHolderByName(name: string): CameraHolder | undefined {
        return this.holders[name];
    }

    createCameraView(name: string, subscene: EngineSubscene) {

    }

    createCameraSocket(name: string, subscene: EngineSubscene) {
        if (this.sockets[name]) {
            console.warn(`[${getClassName(this)}]: Socket with name ${name} already exists, returning old instance`);
            return this.sockets[name];
        }

        return new CameraSocket(name);
    }

    destroySocket(socket: CameraSocket) {
    }
}


export const CameraSystem = new SystemDescription(
    CameraSystemConfig,
    CameraSystemImpl,
    [
        EngineSystem
    ],
);