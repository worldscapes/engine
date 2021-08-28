import {EngineError} from "../error.system";

export class AssetSystemIsNotInitializedError extends EngineError {

    constructor() {
        super("Trying to load resources before AssetSystem initialized");
    }

}