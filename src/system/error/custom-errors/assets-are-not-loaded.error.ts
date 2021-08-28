import {EngineError} from "../error.system";

export class AssetsAreNotLoadedError extends EngineError {

    constructor() {
        super("Trying to access assets while they are not initialized");
    }

}