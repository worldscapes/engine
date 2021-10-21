import {Entity, EntityBeforeInitEvent, EntityOnInitEvent,} from "./entity";
import {EntityExtenderBuilder} from "./extenders";
import {
    EventInjectionConfigurator,
    EventInjectionHost,
    EventInjectionValidator,
    EventInjector
} from "./event-injection/event-injection";
import {EngineSubscene} from "../scene/engine-subscene";
import { EntitySystemImpl } from "./entity.system";

/**
 * Builds new entity constructor using provided accessor builder array
 * @param accessorBuilders Array of descriptor makers to build entity
 * @return Entity factory function
 */
export class EntityBuilder {

    protected static enableDIRecommendations: boolean = true;

    protected _builders: EntityExtenderBuilder<any>[] = [];
    get builders() {
        return this._builders;
    }

    protected validator: EventInjectionValidator = new EventInjectionValidator(this.entityTypeName, []);


    constructor(
        protected entitySystem: EntitySystemImpl,
        protected entityRegisterHook: (entity: Entity) => void,
        readonly entityTypeName: string,
        ...builders: EntityExtenderBuilder<any>[]
    ) {
        this.addExtenders(...builders);
    }

    build(
        scene: EngineSubscene,
        instanceTag: string,
        options?: {
            initialEntityState?: Record<string, any>,
            logEvents?: boolean
        }
    ) {

        const host = new EventInjectionHost(instanceTag, this.validator, { logEvents: options?.logEvents ?? false });

        // Creating entity instance in scene
        const entity = new Entity(this, host, instanceTag, scene);

        // First stage - creating injectors
        const injectors = this._builders.reduce(
            (acc: Record<string, EventInjector>, builder) => {
                return {
                    ...acc,
                    [builder.extenderImplName]: host.createInjector(
                        new EventInjectionConfigurator(builder.extenderImplName, builder.dependencies)
                    )
                }
            },
            {}
        );

        // Second stage - applying extenders
        this._builders.forEach(builder => {
            entity.addExtender(builder, injectors[builder.extenderImplName]);
        })

        // Calling lifecycle hooks
        entity.dispatchEvent(new EntityBeforeInitEvent({})).then();
        entity.dispatchEvent(new EntityOnInitEvent({})).then();

        this.entityRegisterHook(entity);

        return entity;
    }

    /**
     * Used to add extender to current builder
     * @param newExtenderBuilders Added extenders
     * @protected
     */
    protected addExtenders(...newExtenderBuilders: EntityExtenderBuilder<any>[]) {
        this._builders = [...this._builders, ...newExtenderBuilders];

        this.validator = this.createValidator();
        this.validator.check(EntityBuilder.enableDIRecommendations);
    }

    /**
     * Creates new validator using current entityTypeName and extenderBuilders
     */
    protected createValidator(): EventInjectionValidator {
        const validator = new EventInjectionValidator(this.entityTypeName, this._builders);

        // Add base entity events
        validator.applyConfigurator(Entity.dependencyConfigurator);

        return validator;
    }
}