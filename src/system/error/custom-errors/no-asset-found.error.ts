import {EngineError} from "../error.system";

export class NoAssetFoundError extends EngineError {

    constructor(assetName: string) {
        super(`No asset found with name: ${assetName}`);
    }

}