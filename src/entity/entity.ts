import {TransformNode} from "babylonjs";
import {EntityExtenderBuilder} from "./extenders/extenders";
import {EntityBuilder} from "./entity-builder"
import {EventWrap, ExtenderEvent} from "./event-injection/events";
import {EventInjectionConfigurator, EventInjectionHost, EventInjector} from "./event-injection/event-injection";
import {WorldscapesScene} from "../system/scene/worldscapes-scene";

export class EntityBeforeInitEvent extends ExtenderEvent {}

export class EntityOnInitEvent extends ExtenderEvent {}

export class EntityDestroyEvent extends ExtenderEvent {}

/** Used to type custom methods of entity */
export type EntityCustomMethod = Function;
export type EntityCustomMethodContainer = { [key: string]: EntityCustomMethod };

/**
 * Lightweight object that can use extenders to get new functionality
 *
 * User cannot directly manipulate entity, it's done indirectly by extenders.
 *
 * Entity might not have scene representation, but it can influence game process
 *
 * Entity can be destroyed by calling destroy.
 * It emits event for extenders to notify them that entity was destroyed and they need to clear resources
 */
export class Entity {

    static dependencyConfigurator = new EventInjectionConfigurator(
        'base-entity',
        {
            provides: [
                EntityBeforeInitEvent,
                EntityOnInitEvent,
                EntityDestroyEvent,
            ],
        }
    );

    childrenNodes: TransformNode[] = [];

    constructor(
        readonly builder: EntityBuilder,
        protected injectionHost: EventInjectionHost,
        readonly instanceTag: string,
        readonly scene: WorldscapesScene,
    ) {
    }

    dispatchEvent<T extends ExtenderEvent<any>>(event: T): Promise<void> {
        const wrap = new EventWrap(Entity.dependencyConfigurator.extenderName, event);
        this.injectionHost.dispatch(wrap);

        return wrap.onHandlePromise;
    }

    addExtender(extenderBuilder: EntityExtenderBuilder<any>, injector?: EventInjector) {
        // What to do with other entities of this type?
        // this.builder.extend(extenderBuilder);

        extenderBuilder.build(
            this,
            injector ?? this.injectionHost.createInjector(
                new EventInjectionConfigurator(extenderBuilder.extenderName, extenderBuilder.dependencies)
            )
        )

        return this;
    }

    destroy() {
        this.dispatchEvent(new EntityDestroyEvent({})).then();
        console.log(`Destroying entity {${this.instanceTag}}`);
    }
}
