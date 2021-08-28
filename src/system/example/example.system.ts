import {SystemDescription, SystemInstance} from "../system";

export class ExampleSystemConfig {
    // exampleRequired?: number = undefined;
    // exampleDefaultNull: number | null = null;
    // exampleDefaultValue: number = 1;

    // exampleMessage: string = 'example message'
}

export class ExampleSystemImpl extends SystemInstance<ExampleSystemImpl, ExampleSystemConfig> {

    protected async initialize() {
        // console.log("Example created");
    }

    hello() {
        // console.log(this.provider.getProvidedConfig().exampleMessage);
    };
}

export const ExampleSystem = new SystemDescription(
    ExampleSystemConfig,
    ExampleSystemImpl,
    [],
);

export class ExampleSystemConfig2 {
}

export class ExampleSystemImpl2 extends SystemInstance<ExampleSystemImpl2, ExampleSystemConfig2> {

    exampleSystem!: ExampleSystemImpl;

    protected async initialize() {
        // console.log("Example 2 created");
        this.exampleSystem = this.provider.getInjectedSystem(ExampleSystem);

        this.exampleSystem.hello();
    }

    hello() {
        // console.log('hello');
    };
}

export const ExampleSystem2 = new SystemDescription(
    ExampleSystemConfig,
    ExampleSystemImpl2,
    [
        ExampleSystem
    ]
);