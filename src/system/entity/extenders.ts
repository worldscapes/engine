import {EventInjectionConfig, EventInjector} from "./event-injection/event-injection";
import {Resolver} from "../../shared/classes/resolver";
import {Entity} from "./entity";
import {getClassName} from "../../shared/functions/get-class-name";

export interface ExtenderSchema<ExtenderOptionsType extends { config: {} }> {
    extenderTypeName: string,
    config: ExtenderOptionsType,
}

export type EntityExtenderStateUpdateHook = (previousState: any, update: any, entityName: string, entityInstanceTag: string) => void;

/**
 * Removes config field from state type
 */
export type EntityExtenderStateWithoutConfig<StateType extends { config: {} }> = Omit<StateType, 'config'>;

/**
 * Removes all fields except config from state type
 */
export type EntityExtenderStateConfig<StateType extends { config: {} }> = Pick<StateType, 'config'>;

/**
 * Makes config field not required
 */
export type EntityExtenderStateWithNotRequiredConfig<StateType extends { config: {} }> = Omit<StateType, 'config'> & Partial<Pick<StateType, 'config'>>;


/**
 * Is used to create accessor instance with isolated scope
 * Uses accessors to manipulate entity
 * Uses events and effects to communicate other extenders
 * Can create new entity methods via accessors to add custom functionality to it
 */
export type EntityExtenderBuilder<ExtenderOptionsType extends { config: any }> = {

    extenderTag: string;
    extenderTypeName: string;

    config: ExtenderOptionsType['config'];

    /** Name of extender, used to provide more detailed logging */
    extenderImplName: string;

    /** Object that configures builder dependencies */
    dependencies: EventInjectionConfig;

    /**
     * Builds new extender instance
     * Reference to instance is not saved so it should be automatically delete if entity is deleted
     */
    build: (entityInst: Entity, injector: EventInjector, options?: { initialState: any }) => EntityExtenderInstance<ExtenderOptionsType>;
}

export abstract class EntityExtenderInstance<ExtenderStateType extends { config: {} } = { config: {} }> {

    protected static stateUpdateHooks: EntityExtenderStateUpdateHook[] = [];
    static addStateUpdateHook(hook: EntityExtenderStateUpdateHook) { this.stateUpdateHooks.push(hook); }
    static removeStateUpdateHook(removedHook: EntityExtenderStateUpdateHook) { this.stateUpdateHooks = this.stateUpdateHooks.filter(savedHook => savedHook !== removedHook); }

    currentState!: EntityExtenderStateWithNotRequiredConfig<ExtenderStateType>;

    private initializeResolver = new Resolver<void>();

    get onInit() {
        return this.initializeResolver.promise;
    }

    get extenderTypeName() {
        return getClassName(this);
    }

    get entityTypeName() {
        return this.entityInst.builder.entityTypeName;
    }

    get entityTag() {
        return this.entityInst.instanceTag;
    }

    get entityScene() {
        return this.entityInst.scene;
    }

    constructor(
        readonly extenderTag: string,
        private entityInst: Entity,
        protected injector: EventInjector,
        private readonly config: ExtenderStateType['config'],
        private readonly providedInitialState: any,
    ) {
        this.currentState = this.initialState(this.providedInitialState);
        this.initialize().then(() => {
            this.initializeResolver.resolve();
        });
    }

    executeIfEnabled = this.entityInst.executeIfEnabled.bind(this.entityInst);

    /**
     * Is needed in case config and state were provided from outside
     */
    getConfig(): ExtenderStateType['config'] {
        return this.currentState.config ?? this.config;
    }

    getState(): ExtenderStateType {
        return {
            ...this.currentState,
            config: {
                ...this.getConfig(),
            }
        } as ExtenderStateType
    }

    protected updateState(update: Partial<EntityExtenderStateWithoutConfig<ExtenderStateType>>) {
        const previousState = this.currentState;
        this.currentState = {
            ...this.currentState,
            ...update
        }
        EntityExtenderInstance.stateUpdateHooks?.forEach(hook => hook(previousState, update, this.entityInst.builder.entityTypeName, this.entityInst.instanceTag));
    }

    /**
     * Asynchronous method for extender initialization.
     */
    protected abstract initialize(): Promise<void>;

    /**
     * @protected
     * @description
     * Method that is called to set up initial state <br>
     * It's called before initialize hook
     *
     * Everything you save to state should be serializable, all methods will be removed and object references should not be circular, otherwise it can break serialization
     */
    protected abstract initialState(providedInitialState: string): this['currentState'];

}



/**
 * Installer is function that is used to create and configure extender builder inside entity
 * This function is called by actual lib user when creating entities
 *
 * Dependencies and type name is set for installer since it serves interface role in architecture
 *
 * TODO: (Idea) Make EntityBuilders to extend base builder class. Derived builder constructor is installer, it's class name is extenderTypeName
 * This will reduce logic load allow easier interfacing
 */
export class EntityExtenderInstaller<ExtenderOptionsType extends { config: {} }> {

    get extenderImplName() {
        return this.instanceConstructor.name;
    }

    constructor(
        readonly extenderTypeName: string,
        readonly instanceConstructor: new(extenderTag: string, entityInst: Entity, injector: EventInjector, config: ExtenderOptionsType['config'], providedInitialState: any) => EntityExtenderInstance<ExtenderOptionsType>,
        readonly dependencies: EventInjectionConfig,
    ) {}

    install(extenderTag: string, config: ExtenderOptionsType['config']): EntityExtenderBuilder<ExtenderOptionsType> {
        return {
            extenderTag: extenderTag,
            extenderTypeName: this.extenderTypeName,
            config: config,
            extenderImplName: this.extenderImplName,
            dependencies: this.dependencies,
            build: (entityInst, injector, options) => {
                return new this.instanceConstructor(extenderTag, entityInst, injector, config, options?.initialState);
            },
        };
    }
}