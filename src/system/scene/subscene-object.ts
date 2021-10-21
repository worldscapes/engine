import {EngineSubscene} from "./engine-subscene";
import {SceneContainedData} from "./deep-copy-strategies/registry";

export class SubsceneObject<T extends SceneContainedData> {

    constructor(
        readonly subscene: EngineSubscene,
        readonly object: T,
    ) {}
}