import {SystemDescription, SystemInstance} from "../system";

export class EngineError extends Error {
}

export class ErrorSystemConfig {
}

export class ErrorSystemImpl extends SystemInstance<ErrorSystemImpl, ErrorSystemConfig> {

    protected async initialize() {
        console.log("Error system initialized")
        const original = window.onerror;

        window.onerror = function (message, source, lineno, colno, error) {
            if (error instanceof EngineError) {
                console.error(error.message);
                return true;
            }
            return !!(original && original(message, source, lineno, colno, error));
        }

        // console.log(new EngineError('Error test!') instanceof EngineError)
        // throw new EngineError('Error test!');
    }

}

export const ErrorSystem = new SystemDescription(
    ErrorSystemConfig,
    ErrorSystemImpl,
    []
);