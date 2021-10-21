import {IDeviceEvent} from "babylonjs/DeviceInput/Interfaces/inputInterfaces";
import {DeviceType} from "babylonjs";

/**
 * Entity that transforms input of Babylon device to adapt it for input system
 *
 * @example MouseWheel doesn't have release event, need to add it manually to detect wheel ticks and avoid endless hold
 */
export abstract class AbstractInputEventTranslator {

    constructor() {}

    abstract deviceType(): DeviceType;

    abstract translate(event: IDeviceEvent): IDeviceEvent[];
}

