import {InputListener} from "./triggers";

export class DeciderCache<CacheType extends {} = {}> {

    protected cache = new Map<InputListener, CacheType>();

    get(trigger: InputListener): CacheType {
        let triggerCache = this.cache.get(trigger);
        if (!triggerCache) {
            triggerCache = this.initialValueCreator();

            this.cache.set(trigger, triggerCache);
        }
        return triggerCache;
    }

    constructor(protected initialValueCreator: () => CacheType) {}


}