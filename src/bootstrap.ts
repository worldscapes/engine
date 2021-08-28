import {AssetSystem, AssetSystemConfig} from "./system/asset/asset.system";
import {InputSystem, InputSystemConfig} from "./system/input/input.system";
import {PhysicsSystem, PhysicsSystemConfig} from "./system/physics/physics.system";
import {
    ExampleSystem,
    ExampleSystem2,
    ExampleSystemConfig,
    ExampleSystemConfig2
} from "./system/example/example.system";
import {Resolver} from "./shared/resolver";
import {ErrorSystemConfig} from "./system/error/error.system";
import {SystemDescription, SystemInstance, SystemProvider, SystemProviderOptions} from "./system/system";
import {EngineSystem, EngineSystemConfig} from "./system/engine/engine.system";
import {SceneSystem, SceneSystemConfig} from "./system/scene/scene.system";
import {getClassName} from "./shared/get-class-name";
import {SystemIsNotDeclared} from "./entity/extenders/errors/system-is-not-declared";
import {AudioSystem, AudioSystemConfig} from "./system/audio/audio.system";

/**
 * List of arguments that need to be provided for engine bootstrap
 */
class GlobalBootstrapConfig {
}

export interface EngineConfig extends GlobalBootstrapConfig,
    ExampleSystemConfig,
    ExampleSystemConfig2,
    ErrorSystemConfig,
    EngineSystemConfig,
    SceneSystemConfig,
    AssetSystemConfig,
    InputSystemConfig,
    PhysicsSystemConfig,
    AudioSystemConfig {}

export interface EngineBootstrapOptions {
    customSystems?: SystemDescription<any, any>[];
    loggingEnabled?: boolean;
    customProviderOptions?: [ SystemDescription<any, any>, SystemProviderOptions ][];
}

export class EngineBootstrap<CustomConfig extends EngineConfig = EngineConfig> {

    static WorldscapesEngine: EngineBootstrap;

    protected completionResolver = new Resolver<void>();
    protected allProvidedTimeout;

    readonly inBuiltSystems: SystemDescription<any, any>[] = [
        ExampleSystem,
        ExampleSystem2,
        // ErrorSystem,
        EngineSystem,
        SceneSystem,
        AssetSystem,
        InputSystem,
        PhysicsSystem,
        AudioSystem,
    ];

    protected systemProviders!: SystemProvider<any, any>[];

    protected providedConfig!: CustomConfig;

    private constructor(
        protected options: EngineBootstrapOptions
    ) {

        if (this.options.loggingEnabled) {
            console.info(`[${getClassName(this)}]: Initializing engine`);
        }


        if (this.options.loggingEnabled) {
            console.info(`[${getClassName(this)}]: Creating providers`);
        }

        this.systemProviders = [ ...this.inBuiltSystems, ...(options.customSystems ?? []) ].map(
            description => {
                // Looking for custom options
                const [_, customOptions] = this.options?.customProviderOptions?.find(
                    ([systemDescription, options]) => systemDescription === description
                ) ?? [];

                return new SystemProvider(description, customOptions ?? {})
            }
        );

        this.providedConfig = this.mergeConfigs(
            GlobalBootstrapConfig,
            this.systemProviders.map(provider => provider.configConstructor),
        );

        if (this.options.loggingEnabled) {
            console.info(`[${getClassName(this)}]: ` + this.buildNeededFieldsMessage(this.providedConfig));
        }

        this.systemProviders.forEach(systemProvider => systemProvider.getSystem().then(system => {

            this.systemProviders.filter(provider => !provider.isReady()).forEach(provider => provider.injectSystem(system));

            if (this.isAllProvidersComplete(this.systemProviders)) {
                this.completionResolver.resolve();
            }
        }));

        this.provideConfigToProviders(this.providedConfig);
    }

    static initEngine<CustomConfig extends EngineConfig = EngineConfig>(
        options: EngineBootstrapOptions
    ) {
        this.WorldscapesEngine = new EngineBootstrap<CustomConfig>(options);
        return this.WorldscapesEngine;
    }

    toggleLogging(state = !this.options.loggingEnabled) {
        this.options.loggingEnabled = state;
    }

    /**
     * Function to provide part of config fields to configure systems
     * @param configUpdate Part of config
     */
    async provideConfigPart(configUpdate: Partial<EngineConfig>): Promise<void> {

        if (this.options.loggingEnabled && Object.keys(configUpdate).length > 0) {
            console.info(this.buildProvidedFieldsMessage(configUpdate));
        }

        this.providedConfig = {...this.providedConfig, ...configUpdate};
        this.provideConfigToProviders(configUpdate);

        if (this.assertAllFieldsProvided(this.providedConfig)) {
            if (this.allProvidedTimeout) {
                clearTimeout(this.allProvidedTimeout);
            }
            this.allProvidedTimeout = setTimeout(() => {
                if (this.isAllProvidersComplete(this.systemProviders)) {
                    this.completionResolver.resolve();
                } else {
                    console.warn(`Entire config provided, but not all systems are initialized:\n[${
                        this.systemProviders.filter(provider => !provider.isReady()).map(provider => provider.type).join(', ')
                    }]`);
                }
            }, 5000);
        }

        return this.completionResolver.promise;
    }

    /**
     * Function to receive system provider inside extenders layer
     * @param description needed system description
     */
    async getSystem<SystemType extends SystemInstance<SystemType, SystemConfigType>,
        SystemConfigType,
        >(description: SystemDescription<SystemType, SystemConfigType>): Promise<SystemType> {
        const provider: SystemProvider<SystemType, SystemConfigType> | undefined = this.systemProviders.find(provider => provider.type === description.type);

        if (!provider) {
            throw new SystemIsNotDeclared(getClassName(this), description);
        }

        return provider?.getSystem();
    }

    protected provideConfigToProviders(configUpdate: Partial<EngineConfig>) {
        this.systemProviders.forEach(provider => provider.injectConfig(configUpdate));
    }

    protected buildNeededFieldsMessage(config: Partial<EngineConfig>) {
        return `[Bootstrap]: \nExpected config fields to start: [${
            Object.entries(config)
                .filter(([key, value]) => value === undefined)
                .map(([key, value]) => key).join(', ')
        }]\nAdditional config fields: [${
            Object.entries(config)
                .filter(([key, value]) => value !== undefined)
                .map(([key, value]) => key).join(', ')
        }]`;
    }

    protected buildProvidedFieldsMessage(config: Partial<EngineConfig>) {
        return `[Bootstrap]: Received fields: [${Object.keys(config).join(', ')}]`;
    }

    protected assertAllFieldsProvided(config: EngineConfig): config is Required<EngineConfig> {
        return Object.values(config).reduce(
            (acc, value) => acc && value !== undefined,
            true
        );
    }

    protected isAllProvidersComplete(providers: SystemProvider<any, any>[]): boolean {
        return providers.reduce((acc: boolean, provider) => acc && provider.isReady(), true);
    }

    protected mergeConfigs(base: new () => any, additional: (new () => any)[]) {
        return additional.reduce((obj, constructor) => ({...obj, ...new constructor()}), new base());
    }

}