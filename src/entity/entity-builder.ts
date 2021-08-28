import {Entity, EntityBeforeInitEvent, EntityOnInitEvent,} from "./entity";
import {EntityExtenderBuilder} from "./extenders/extenders";
import {EventInjectionConfigurator, EventInjectionValidator, EventInjector} from "./event-injection/event-injection";
import {WorldscapesScene} from "../system/scene/worldscapes-scene";

/**
 * Builds new entity constructor using provided accessor builder array
 * @param accessorBuilders Array of descriptor makers to build entity
 * @return Entity factory function
 */
export class EntityBuilder {

    protected static enableDIRecommendations: boolean = true;

    protected extenderBuilders: EntityExtenderBuilder<any>[] = [];
    protected validator: EventInjectionValidator = new EventInjectionValidator(this.entityTypeName, []);

    protected constructor(
        readonly entityTypeName: string
    ) {}

    static create(entityTypeName: string, ...builders: EntityExtenderBuilder<any>[]) {
        const entityBuilder = new EntityBuilder(entityTypeName);
        entityBuilder.extend(...builders);
        return entityBuilder;
    }

    build(scene: WorldscapesScene, instanceTag: string) {

        const host = this.validator.createHost();

        // Creating entity node in scene
        const entity = new Entity(this, host, instanceTag, scene);

        // First stage - creating injectors
        const injectors = this.extenderBuilders.reduce(
            (acc: Record<string, EventInjector>, builder) => {
                return {
                    ...acc,
                    [builder.extenderName]: host.createInjector(
                        new EventInjectionConfigurator(builder.extenderName, builder.dependencies)
                    )
                }
            },
            {}
        );

        // Second stage - applying extenders
        this.extenderBuilders.forEach(builder => {
            entity.addExtender(builder, injectors[builder.extenderName]);
        })

        // Calling lifecycle hooks
        entity.dispatchEvent(new EntityBeforeInitEvent({})).then();
        entity.dispatchEvent(new EntityOnInitEvent({})).then();

        scene.addEntity(entity);

        return entity;
    }

    extend(...newBuilders: EntityExtenderBuilder<any>[]) {
        this.extenderBuilders = [...this.extenderBuilders, ...newBuilders];

        this.validator = this.createValidator();
        this.validator.check(EntityBuilder.enableDIRecommendations);
    }

    /**
     * Creates new validator using current entityTypeName and extenderBuilders
     */
    protected createValidator(): EventInjectionValidator {
        const validator = new EventInjectionValidator(this.entityTypeName, this.extenderBuilders);

        // Add base entity events
        validator.applyConfigurator(Entity.dependencyConfigurator);

        return validator;
    }
}