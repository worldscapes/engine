import {EventInjectionConfig, EventInjector} from "../event-injection/event-injection";
import {Resolver} from "../../shared/resolver";
import {Entity} from "../entity";

export type EntityExtenderInstaller<ExtenderOptionsType extends { config: {} }> = (config: ExtenderOptionsType['config']) => EntityExtenderBuilder<ExtenderOptionsType>

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

    /** Name of extender, used to provide more detailed logging */
    extenderName: string;

    /** Object that configures builder dependencies */
    dependencies: EventInjectionConfig;

    /**
     * Builds new extender instance
     * Reference to instance is not saved so it should be automatically delete if entity is deleted
     */
    build: (entityInst: Entity, injector: EventInjector) => EntityExtenderInstance<ExtenderOptionsType>;
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
        private entityInst: Entity,
        protected injector: EventInjector,
        private readonly config: ExtenderStateType['config']
    ) {
        this.currentState = this.initialState();
        this.initialize().then(() => {
            this.initializeResolver.resolve();
        });
    }

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

    updateState(update: Partial<EntityExtenderStateWithoutConfig<ExtenderStateType>>) {
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
    protected abstract initialState(): this['currentState'];
}


export function createEntityExtenderInstaller<ExtenderStateType extends { config: {} }>(
    installerOptions: {
        dependencies: EventInjectionConfig,
        instanceConstructor: new(entityInst: Entity, injector: EventInjector, options: ExtenderStateType['config']) => EntityExtenderInstance < ExtenderStateType >,
    }
): EntityExtenderInstaller<ExtenderStateType> {
    return (config: ExtenderStateType['config']) => ({
        extenderName: installerOptions.instanceConstructor.name,
        dependencies: installerOptions.dependencies,
        build: (entityInst: Entity, injector: EventInjector) => {
            return new installerOptions.instanceConstructor(entityInst, injector, config);
        },
    });
}