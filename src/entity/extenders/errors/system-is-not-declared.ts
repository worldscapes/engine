import {EngineError} from "../../../system/error/error.system";
import {SystemDescription} from "../../../system/system";

export class SystemIsNotDeclared extends EngineError {

    constructor(throwerName: string, systemDescription: SystemDescription<any, any>) {
        super(`[${throwerName}]: "System [${systemDescription.type}] provider is not declared inside engine"`);
    }


}