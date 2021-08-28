import {
    EventWrap,
    ExtenderEvent,
    ExtenderEventType,
    ExtenderReceiverEvent,
    GetEventConstructorArgType,
    GetReceiverEventBodyType,
    ReceiverFunction
} from "./events";
import {EntityDependencyError} from "../extenders/errors/entity-dependency.error";
import {EntityExtenderBuilder} from "../extenders/extenders";
import {getClassName} from "../../shared/get-class-name";
import {unique} from "../../shared/unique";

/**
 * Event migration plan:
 * + Make events based on classes
 * + Add way for injector to track event handing
 * + Implement event tracking not inside event, but in special event container
 * + Add way to determine which events are dispatched and subscribed
 * - Add event type that requires handling
 * + Add way await track event handling
 *
 * + Dispatch, supply and receive can't infer event type out of ExtenderEvent['type']
 *
 * + Split events between subscribed and dispatched to avoid dispatched event caching in injector
 * - Make extender's name inferred from extender builder
 */

export type ExtenderEventDispatcher<EventType extends ExtenderEvent<any>> = (eventBody: GetEventConstructorArgType<EventType>) => void;

/** Function that accepts wrap and is called in response to dispatched event */
export type WrapEffect<EventType extends ExtenderEvent<any>> = (event: EventWrap<EventType>) => void;
/** Function that is called in response to dispatched event */
export type EventEffect<EventType extends ExtenderEvent<any>> = (event: EventType) => void;
/** Object that contains effects for respective events */
export type ExtenderEventEffects = Record<string, EventEffect<any>>
/** Object that contains functions to unsubscribe from respective events */
export type ExtenderEventEffectUnsubscriber = () => void;


/**
 * Used to collect and validate entity dependencies when creating new entity
 */
export class EventInjectionValidator {

    protected _providedEvents: ExtenderEventType<ExtenderEvent<any>>[] = [];
    protected _requestedEvents: ExtenderEventType<ExtenderEvent<any>>[] = [];

    get providedEvents() {
        return this._providedEvents;
    }

    get requestedEvents() {
        return this._requestedEvents;
    }

    constructor(readonly entityTypeName: string, readonly builders: EntityExtenderBuilder<any>[]) {

        this.builders.forEach(builder => this.applyConfigurator(
            new EventInjectionConfigurator(builder.extenderName, builder.dependencies)
        ));
    }

    check(recommendations: boolean = false) {
        const notProvided = this._requestedEvents.filter(eventType => !this._providedEvents.includes(eventType));
        const notRequested = this._providedEvents.filter(eventType => !this._requestedEvents.includes(eventType));

        // console.log(this.requestedEvents);
        // console.log(this.providedEvents);
        // console.log(notRequested);
        // console.log(notProvided);

        if (recommendations && notRequested?.length > 0) {
            console.warn(`There are some explicit events provided, maybe it's possible to optimize dependencies: ${
                notRequested.reduce((acc, eventType) => acc + '\n- ' + eventType, '')
            }`);
        }

        if (notProvided?.length > 0) {
            throw new EntityDependencyError(`Events [${notProvided.map(type => type.name).join(', ')}] are requested, but not provided on entity [${this.entityTypeName}].\n 1) Check if all needed extenders applied\n 2) Check if events provided correctly by extenders \n 3) Implement extender providing and handling events`);
        }
    }

    isEventProvided<T extends ExtenderEvent<any>>(eventType: ExtenderEventType<T>): boolean {
        return !!this._providedEvents.includes(eventType);
    }


    applyConfigurator(configurator: EventInjectionConfigurator) {
        this.provideEvents(configurator.provides);
        this.requestEvents(configurator.requests);
    }

    createHost(): EventInjectionHost {
        return new EventInjectionHost(this);
    }

    protected provideEvents(eventTypes: ExtenderEventType<ExtenderEvent<any>>[]) {
        this._providedEvents = this._providedEvents.concat(eventTypes.filter(eventType => !this._providedEvents.includes(eventType)));
    }

    protected requestEvents(eventTypes: ExtenderEventType<ExtenderEvent<any>>[]) {
        this._requestedEvents = this._requestedEvents.concat(eventTypes.filter(eventType => !this._requestedEvents.includes(eventType)));
    }
}


/**
 * Used to map events from dispatchers to subscribers
 */
export class EventInjectionHost {
    protected effects = new Map<ExtenderEventType<ExtenderEvent<any>>, WrapEffect<any>[]>();

    constructor(readonly validator: EventInjectionValidator) {
    }

    createInjector(configurator: EventInjectionConfigurator) {
        return new EventInjector(configurator, this);
    }

    dispatch<EventType extends ExtenderEvent<any>>(wrap: EventWrap<EventType>) {
        if (this.validator.isEventProvided(wrap.event.type)) {
            this.effects.get(wrap.event.type)?.forEach(effect => effect(wrap))
        } else {
            throw new EntityDependencyError(`[${getClassName(this)}]:\nTrying to access event that was not provided in entity\nDispatched event type: ${wrap.event.type.name}\nRequested events: [${this.validator.providedEvents.map(eventType => eventType.name).join(', ')}]`)
        }
    }

    addEffect<EventType extends ExtenderEvent<any>>(
        eventType: ExtenderEventType<EventType>,
        newEffect: WrapEffect<EventType>
    ) {
        this.effects.set(
            eventType,
            [
                ...(this.effects.get(eventType) ?? []),
                newEffect
            ]
        );

        return () => {
            this.effects.set(
                eventType,
                (this.effects.get(eventType) ?? []).filter(effect => effect !== newEffect)
            );
        }
    }
}


export interface EventInjectionConfig {
    provides?: ExtenderEventType<ExtenderEvent<any>>[];
    willSubscribe?: ExtenderEventType<ExtenderEvent<any>>[];
    willDispatch?: ExtenderEventType<ExtenderEvent<any>>[];
}


/**
 * Used for collecting dependencies from EntityExtenderBuilder
 * Injection cases:
 *  - extender provides event and subscribes to it (use provide() and subscribe())
 *  - extender requests event and subscribes to it (use subscribe())
 *  - extender provides event and dispatches it (use provide and dispatch())
 *  - extender requests event and dispatches it (use dispatch())
 *
 *  - extender subscribes to event, but it's not mandatory
 *  - extender dispatches event, but it's not mandatory
 */
export class EventInjectionConfigurator {

    get provides() {
        return unique(this.config.provides ?? []);
    }

    get requests() {
        return unique([ ...(this.config.willDispatch ?? []), ...(this.config.willSubscribe ?? []) ]);
    }

    get willSubscribe() {
        return unique(this.config.willSubscribe ?? []);
    }

    get willDispatch() {
        return unique(this.config.willDispatch ?? []);
    }

    constructor(
        readonly extenderName: string,
        readonly config: EventInjectionConfig
    ) {}

}


/**
 * Used to access entity events API from extenders
 *
 * Injector is responsible for caching unhandled events before subscription
 */
export class EventInjector {

    /**
     * Used to cache extender subscriptions
     * @protected
     */
    protected eventEffects = new Map<ExtenderEventType<ExtenderEvent<any>>, EventEffect<any>>();

    /**
     * Cache for event wraps that was not handled by extender
     * Those events will be handled as soon as extender adds new effect
     */
    protected cachedWraps = new Map<ExtenderEventType<ExtenderEvent<any>>, EventWrap<any>[]>();


    constructor(
        protected configurator: EventInjectionConfigurator,
        protected host: EventInjectionHost
    ) {
        this.configurator.willSubscribe.forEach(eventType => {
            host.addEffect(eventType, wrap => {
                const effect = this.eventEffects.get(eventType);
                if (effect) {
                    console.log(`[${getClassName(this)}: ${this.configurator.extenderName}]:\nHandling\nDispatcher: ${wrap.extenderName}\nEventType: ${wrap.event.type.name}\n`);
                    effect(wrap.event);
                    wrap.markHandled();
                } else {
                    console.log(`[${getClassName(this)}: ${this.configurator.extenderName}]:\nCaching\nSubscriber: ${wrap.extenderName}\nEventType: ${wrap.event.type.name}\n`);
                    this.cachedWraps.set(
                        eventType,
                        [ ...(this.cachedWraps.get(eventType) ?? []), wrap ]
                    );
                }
            })
        });
    }

    /**
     * Used to subscribe to entity events
     *
     * Overrides previous subscriptions for same event
     * @param eventClass event type to subscribe
     * @param effect effect to react on event
     */
    subscribe<EventType extends ExtenderEvent<any>>(
        eventClass: ExtenderEventType<EventType>,
        effect: EventEffect<EventType>
    ): ExtenderEventEffectUnsubscriber {
        if (!this.configurator.willSubscribe.includes(eventClass)) {
            throw new EntityDependencyError(`Trying to subscribe to event that was not requested for subscription in config.\nEntity:   [${this.host.validator.entityTypeName}]\nExtender: [${this.configurator.extenderName}]\nEvent:    [${eventClass.name}]`);
        }

        this.eventEffects.set(eventClass, effect);

        const cachedWraps = this.cachedWraps.get(eventClass);
        console.log(`[${getClassName(this)}: ${this.configurator.extenderName}]:\nExtender subscribed to [${eventClass.name}]\nHandling ${cachedWraps?.length ?? 0} cached events`);

        cachedWraps?.forEach((wrap) => {
            effect(wrap.event as EventType);
            wrap.markHandled();
        })

        return () => {
            const currentEffect = this.eventEffects.get(eventClass);
            if (currentEffect === effect) {
                this.eventEffects.delete(eventClass);
            }
        }
    }

    /**
     * Used to get dispatcher for dispatching event inside entity
     * @param eventClass event type of dispatcher
     */
    getDispatcher<EventType extends ExtenderEvent<any>>(eventClass: ExtenderEventType<EventType>): ExtenderEventDispatcher<EventType> {

        if (!this.configurator.willDispatch.includes(eventClass)) {
            throw new EntityDependencyError("Trying to get dispatcher for event that was not requested for dispatching in config.");
        }

        return async eventBody => {
            const event = new eventClass(eventBody);
            const wrappedEvent = new EventWrap(this.configurator.extenderName, event)
            this.host.dispatch(wrappedEvent);
            return wrappedEvent.onHandlePromise;
        }
    }

    /**
     * Method to dispatch receiver events conveniently
     */
    async receive<EventType extends ExtenderReceiverEvent<any>>(
        eventClass: ExtenderEventType<EventType>,
        receiverFn: ReceiverFunction<GetReceiverEventBodyType<EventType>>
    ): Promise<void> {

        if (!this.configurator.requests.includes(eventClass)) {
            throw new EntityDependencyError("Trying to receive event that was not requested.");
        }

        const wrappedEvent = new EventWrap(
            this.configurator.extenderName,
            new eventClass(receiverFn as unknown as GetEventConstructorArgType<EventType>)
        );

        this.host.dispatch(wrappedEvent as EventWrap<GetReceiverEventBodyType<EventType>>);

        return wrappedEvent.onHandlePromise;
    }

    /**
     * Creates supplier for given receiver event
     */
    createSupplier<EventType extends ExtenderReceiverEvent<any>>(
        eventType: ExtenderEventType<EventType>
    ): ExtenderReceiverEventSupplier<EventType> {
        return new ExtenderReceiverEventSupplier(this, eventType);
    }
}


/**
 * Class that provides convenient interface for receiver events handling
 */
export class ExtenderReceiverEventSupplier<EventType extends ExtenderReceiverEvent<any>> {


    protected cachedData?: GetReceiverEventBodyType<EventType>;

    constructor(
        protected injector: EventInjector,
        protected eventType: ExtenderEventType<EventType>
    ) {}


    /**
     * Takes data that will be provided to all subsequent events.
     * Can be called many times to changed cached value
     *
     * All events before initial supply are cached to be handled later
     * @param data
     */
    supply(data: GetReceiverEventBodyType<EventType>) {
        const firstTimeSupply = !this.cachedData;
        this.cachedData = data;

        if (firstTimeSupply) {
            this.injector.subscribe(
                this.eventType,
                (event) => {
                    event.body.receiver(this.cachedData);
                }
            );
        }
    }
}