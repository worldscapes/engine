import {TransformNode} from "babylonjs";
import {EntityExtenderBuilder, EntityExtenderInstance} from "./extenders";
import {EntityBuilder} from "./entity-builder"
import {EventWrap, ExtenderEvent} from "./event-injection/events";
import {EventInjectionConfigurator, EventInjectionHost, EventInjector} from "./event-injection/event-injection";
import {EngineSubscene} from "../scene/engine-subscene";

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

    protected extenders: EntityExtenderInstance<any>[] = [];
    protected active: boolean = true;

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
        readonly scene: EngineSubscene,
    ) {}

    getEntityStateSummary(): Record<string, any> {
        return this.extenders.reduce(
            (acc, extender) => {
                return {
                    ...acc,
                    [extender.extenderTag]: extender.getState()
                }
            },
            {}
        );
    }

    /**
     * Returns function that executes given callback only if entity is active
     */
    executeIfEnabled<FunctionType extends (...args: any) => void>(f: FunctionType): FunctionType {
        return (
            (...args) => {
                if (this.active && this.scene.isActive()) {
                    return f(...args);
                }
            }
        ) as FunctionType;
    }

    isActive() {
        return this.active;
    }

    toggle(newState: boolean = !this.active) {
        this.active = newState;
    }

    dispatchEvent<EventType extends ExtenderEvent<any>>(eventInst: EventType): Promise<void> {
        const wrappedEvent = new EventWrap(Entity.dependencyConfigurator.extenderName, eventInst);
        this.injectionHost.dispatch(wrappedEvent);
        return wrappedEvent.onHandlePromise;
    }

    addExtender(extenderBuilder: EntityExtenderBuilder<any>, injector?: EventInjector, initialState?: any) {
        // What to do with other entities of this type?
        // this.builder.extend(extenderBuilder);

        const extender = extenderBuilder.build(
            this,
            injector ?? this.injectionHost.createInjector(
                new EventInjectionConfigurator(extenderBuilder.extenderImplName, extenderBuilder.dependencies)
            ),
            initialState ? { initialState } : undefined
        )
        this.extenders.push(extender);

        return this;
    }

    destroy() {
        this.dispatchEvent(new EntityDestroyEvent({})).then();
        console.log(`Destroying entity {${this.instanceTag}}`);
    }
}
