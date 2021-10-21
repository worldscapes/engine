import {DeviceType, PointerInput} from "babylonjs";
import { IDeviceEvent } from "babylonjs/DeviceInput/Interfaces/inputInterfaces";
import {AbstractInputEventTranslator} from "./translator";

export class MouseTranslator extends AbstractInputEventTranslator {

    lastHorizontalValue!: number | null;
    lastVerticalValue!: number | null;

    override deviceType(): DeviceType {
        return DeviceType.Mouse;
    }

    override translate(event: IDeviceEvent): IDeviceEvent[] {
        switch (event.inputIndex) {
            case PointerInput.MouseWheelY:
                return [
                    {
                        ...event,
                        previousState: 0,
                    },
                    {
                        ...event,
                        previousState: event.currentState,
                        currentState: 0,
                    },
                ]

            // Override PointerInput.DeltaHorizontal to increase precision
            case PointerInput.Horizontal:
                const previousHorizontalValue = this.lastHorizontalValue;
                this.lastHorizontalValue = event.currentState;
                if (previousHorizontalValue == null || this.lastHorizontalValue == null) {
                    return [ event ];
                }
                return [
                    event,
                    {
                        ...event,
                        inputIndex: PointerInput.DeltaHorizontal,
                        currentState: previousHorizontalValue - this.lastHorizontalValue
                    }
                ];

            case PointerInput.DeltaHorizontal:
                return [];

            // Override PointerInput.DeltaVertical to increase precision
            case PointerInput.Vertical:
                const previousVerticalValue = this.lastVerticalValue;
                this.lastVerticalValue = event.currentState;
                if (previousVerticalValue == null || this.lastVerticalValue == null) {
                    return [ event ];
                }
                return [
                    event,
                    {
                        ...event,
                        inputIndex: PointerInput.DeltaVertical,
                        currentState: previousVerticalValue - this.lastVerticalValue
                    }
                ];
            case PointerInput.DeltaVertical:
                return [];

            default:
                return [ event ];
        }
    }

}