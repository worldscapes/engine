import {SystemDescription, SystemInstance} from "../system";

/**
 * @example Required config property. Make sure to assign undefined to it, otherwise it will not be detected by engine
 *
 * exampleRequired?: number = undefined;
 */

/**
 * @example Optional property with default number value
 *
 * exampleDefaultNumber: number = 1;
 */

/**
 * @example Optional property with default string value.
 *
 * exampleDefaultString: string = 'tag1'
 */

/**
 * @example Optional property with default null value. Usually needed for optional functionality (@see {@link EngineSystemConfig}).
 *
 * exampleDefaultNull: number | null = null;
 */
export class ExampleSystemConfig {
    // exampleRequired?: number = undefined;
    // exampleDefaultNumber: number = 1;
    // exampleDefaultString: string = 'example message';
    // exampleDefaultNull: number | null = null;
}

export class ExampleSystemImpl extends SystemInstance<ExampleSystemImpl, ExampleSystemConfig> {

    /**
     * @see {@link SystemInstance.initialize}
     * @protected
     */
    protected async initialize() {
    }

    /**
     * Custom public method of system
     */
    protected sayHello(name: string) {
        console.log(this.buildRandomHelloMessage(name))
    };

    /**
     * Custom internal method of system
     */
    protected buildRandomHelloMessage(name: string) {
        const messages = [
            `Hello, ${name}`,
            'Hello whoever you are!',
            `Nice to see you, ${name}!`,
        ];
        return messages[Math.ceil(Math.random() * messages.length)];
    };
}


/**
 * @description
 * Object that contains system's additional options
 * It can be passed to wEngine to request system
 */
export const ExampleSystem = new SystemDescription(
    ExampleSystemConfig,
    ExampleSystemImpl,
    [],
);