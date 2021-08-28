import {Resolver} from "../../shared/resolver";

export type ExtenderEventType<T extends ExtenderEvent<any>> = new (body: GetEventConstructorArgType<T>) => T;

/**
 * Is used to extract generic body type from event type
 */
export type GetEventConstructorArgType<T extends ExtenderEvent<any>> =
    T extends ExtenderReceiverEvent<infer R1> ?
    ReceiverFunction<R1>
    :
    T extends ExtenderEvent<infer R2> ? R2 : never;


/**
 * Is used to extract generic body type from event type
 */
export type GetReceiverEventBodyType<T extends ExtenderReceiverEvent<any>> = T extends ExtenderReceiverEvent<infer R> ? R : never;

/**
 * Is used to designate event type
 * Generic argument describes body for this event type
 */
export abstract class ExtenderEvent<T extends {} = {}> {

    /**
     * Returns constructor of current event to identify it
     */
    get type(): ExtenderEventType<this> {
        return Object.getPrototypeOf(this).constructor;
    }

    constructor(readonly body: T) {}
}

/**
 * Function that receives data to process
 */
export type ReceiverFunction<T> = (data: T) => void;


/**
 * Event used to execute function in context, provided by event handler
 */
export abstract class ExtenderReceiverEvent<T extends {}> extends ExtenderEvent<{ receiver: ReceiverFunction<T> }> {

    constructor(private receiver: ReceiverFunction<T>) {
        super({ receiver: receiver });
    }
}


/**
 * Object that used to wrap event and track it's handling
 */
export class EventWrap<T extends Record<string, any> = {}> {

    protected resolver = new Resolver<void>();

    /**
     * Promise to track event handing
     */
    get onHandlePromise() {
        return this.resolver.promise;
    }

    constructor(readonly extenderName: string, readonly event: ExtenderEvent<T>) {}

    /**
     * Notifies event creator that event was handled.
     * It's done automatically by event injector.
     */
    markHandled() {
        this.resolver.resolve();
    }
}