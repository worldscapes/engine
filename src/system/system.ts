import {Resolver} from "../shared/resolver";
import {getClassName} from "../shared/get-class-name";

/**
 * Base class for system implementation.
 *
 * Steps to add new system:
 *  - Create system folder and file
 *  - Create system config
 *  - Create system description
 *  - Create system implementation class
 *  - Create system provider using description and implementation
 *  - Register system providers in bootstrap
 *  - Merge system config interface to global config type
 *
 * Implements SystemDescription interface so it can be used as description
 *
 * Systems should not be used to store game state as they are not serialized
 *
 * Consider storing state in special entity
 */
export abstract class SystemInstance<SystemType extends SystemInstance<SystemType, SystemConfigType>,
    SystemConfigType extends {}> implements SystemDescription<SystemType, SystemConfigType> {

    //region #Description Impl
    get type() {
        return this.description.type;
    }

    get required() {
        return this.description.required;
    }

    get configConstructor() {
        return this.description.configConstructor;
    }

    get systemConstructor() {
        return this.description.systemConstructor;
    }

    //endregion

    private initializeResolver = new Resolver<void>();

    /**
     * Gives promise that is resolved once system is initialized and safe to call
     */
    get onInit() {
        return this.initializeResolver.promise;
    }

    constructor(
        protected description: SystemDescription<SystemType, SystemConfigType>,
        protected provider: SystemProvider<SystemType, SystemConfigType>,
    ) {
        console.log(`[${getClassName(this)}]: System created, starting initialization`)
        this.initialize().then(() => {
            this.initializeResolver.resolve();
            console.log(`[${getClassName(this)}]: Initialized system`)
        });
    }

    /**
     * Asynchronous method for system initialization.
     *
     * Should return promise that is resolved when system is ready to use.
     */
    protected abstract initialize(): Promise<void>;
}


/**
 * Object that describes system configuration.
 *
 * It contains system constructor, config template constructor, systems required for current system.
 */
export class SystemDescription<
    SystemType extends SystemInstance<SystemType, SystemConfigType>,
    SystemConfigType extends {}
> {

    /**
     * Returns unique tag to identify system description.
     * This tag is automatically created using system class name.
     */
    get type(): string {
        return this.systemConstructor.name;
    };

    constructor(
        readonly configConstructor: new (...args) => SystemConfigType,
        readonly systemConstructor: new (description: SystemDescription<SystemType, SystemConfigType>, provider: SystemProvider<SystemType, SystemConfigType>) => SystemType,
        readonly required: SystemDescription<any, any>[],
    ) {
    }
}


export class SystemProviderOptions {
    loggingEnabled?: boolean;
}

/**
 * Wrapper class that handles system dependency injection and provides system to consumers as soon as it's ready to use
 *
 * Implements SystemDescription interface so it can be used as description
 */
export class SystemProvider<
    SystemType extends SystemInstance<SystemType, SystemConfigType>,
    SystemConfigType extends {}
> implements SystemDescription<SystemType, SystemConfigType> {

    protected systemInstance!: SystemType;
    protected systemResolver = new Resolver<SystemType>();

    injectedConfig: Partial<SystemConfigType> = {};
    injectedSystems: Record<string, SystemInstance<any, any>> = {};

    private allConfigFieldsInjectedReported = false;
    private allSystemsInjectedReported = false;

    //region #Description Impl
    get type() {
        return this.description.type;
    }

    get required() {
        return this.description.required;
    }

    get configConstructor() {
        return this.description.configConstructor;
    }

    get systemConstructor() {
        return this.description.systemConstructor;
    }

    //endregion

    constructor(
        protected description: SystemDescription<SystemType, SystemConfigType>,
        protected options: SystemProviderOptions = {},
    ) {
        if (this.options.loggingEnabled) {
            console.info(`[${getClassName(this)}: ${this.description.type}]: Created\nExpected config fields: [${
                this.getExpectedConfigKeys().join(', ')
            }]\nExpected systems: [${
                this.getRequiredSystemTypes().join(', ')  
            }]`);
        }

        this.createIfReady();
    }

    /**
     * Toggles logging on provider
     */
    toggleLogging(state: boolean = !this.options?.loggingEnabled) {
        this.options = {
            ...(this.options ?? {}),
            loggingEnabled: state
        };
    }

    /**
     * System will be provided as soon as entire config was provided and all needed systems were provided
     */
    async getSystem(): Promise<SystemType> {
        return this.systemResolver.promise;
    }


    /**
     * Returns instance of injected system
     * @param description
     */
    getInjectedSystem<InjectedSystemType extends SystemInstance<InjectedSystemType, SystemConfigType>,
        SystemConfigType extends {}>(description: SystemDescription<InjectedSystemType, SystemConfigType>): InjectedSystemType {
        const system = this.injectedSystems[description.type];
        if (!system) {
            throw new Error(`[${getClassName(this)}: ${this.description.type}]: Tried to get system of type [${description.type}], but it was not requested in [${this.description}] config`)
        }
        return this.injectedSystems[description.type] as InjectedSystemType;
    }


    /**
     * Returns config injected into provider
     */
    getInjectConfig(): Required<SystemConfigType> {
        return this.injectedConfig as Required<SystemConfigType>;
    }


    /**
     * Accepts any config and takes needed properties out of it
     *
     * @param newConfig
     */
    injectConfig(newConfig: Partial<SystemConfigType>) {

        const newConfigKeys = Object.keys(newConfig);
        const usedConfigKeys = this.getExpectedConfigKeys().filter(key => newConfigKeys.includes(key) && newConfig[key] != null);
        usedConfigKeys.forEach(key => this.injectedConfig[key] = newConfig[key])

        if (this.options?.loggingEnabled && usedConfigKeys.length > 0) {

            console.log(`[${getClassName(this)}: ${this.description.type}]: Received config fields [${
                usedConfigKeys.join(', ')
            }]`);
        }

        if (this.allConfigFieldsInjected()) {

            if (this.options?.loggingEnabled && !this.allConfigFieldsInjectedReported) {
                console.log(`[${getClassName(this)}: ${this.description.type}]: All required config fields provided`);
            }
            this.allConfigFieldsInjectedReported = true;

            this.createIfReady();
        }
    }

    /**
     * Accepts any system and keeps it if needed
     *
     * @param system
     */
    injectSystem<T extends SystemInstance<T, any>>(system: T) {

        const providedSystemUsed = this.getRequiredSystemTypes().includes(system.type);
        if (providedSystemUsed) {
            this.injectedSystems[system.type] = system;
        }

        if (this.options?.loggingEnabled && providedSystemUsed) {
            console.log(`[${getClassName(this)}: ${this.description.type}]: Received system [${system.type}]`);
        }

        if (this.allSystemsInjected()) {

            if (this.options?.loggingEnabled && !this.allSystemsInjectedReported) {
                console.log(`[${getClassName(this)}: ${this.description.type}]: All required systems provided`);
            }
            this.allSystemsInjectedReported = true;

            this.createIfReady();
        }
    }


    /**
     * Returns list of descriptions of systems that need to be injected
     */
    getRemainingSystems(): SystemDescription<any, any>[] {
        return this.description.required.filter(requiredSystem => !this.injectedSystems[requiredSystem.type]);
    }

    /**
     * Returns list of config fields that need to be injected
     */
    getRemainingConfigFields(): string[] {
        return this.getExpectedConfigKeys().filter(key => this.injectedConfig[key] === undefined);
    }


    /**
     * Returns true if required system is injected
     * @param description
     */
    isSystemInjected(description: SystemDescription<any, any>): boolean {
        return !!this.injectedSystems[description.type];
    }

    /**
     * Returns true if all systems are injected
     */
    allSystemsInjected(): boolean {
        return this.getRemainingSystems().length === 0;
    }

    /**
     * Returns true if all config fields are injected
     */
    allConfigFieldsInjected(): boolean {
        return this.getRemainingConfigFields().length === 0;
    }

    /**
     * Checks if everything was injected for system
     */
    isReady(): boolean {
        return this.allConfigFieldsInjected() && this.allSystemsInjected();
    }

    /**
     * Returns true if system is created
     */
    isCreated(): boolean {
        return !!this.systemInstance;
    }

    /**
     * Checks if provider complete and creates system instance
     * @protected
     */
    protected createIfReady() {

        const isReady = this.isReady();
        const isCreated = this.isCreated();

        if (isReady && !isCreated) {

            if (this.options?.loggingEnabled) {
                console.log(`[${getClassName(this)}: ${this.description.type}]: Creating system`);
            }

            this.systemInstance = new this.systemConstructor(this.description, this);
            this.systemInstance.onInit.then(() => {

                if (this.options?.loggingEnabled) {
                    console.log(`[${getClassName(this)}: ${this.description.type}]: System started`);
                }

                this.systemResolver.resolve(this.systemInstance);
            });
        }
    }

    /**
     * Returns list of all expected config keys
     * @protected
     */
    protected getExpectedConfigKeys(): string[] {
        return Object.keys(new this.description.configConstructor());
    }

    /**
     * Returns list of all required system types
     * @protected
     */
    protected getRequiredSystemTypes(): string[] {
        return this.description.required.map(required => required.type);
    }
}