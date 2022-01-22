import {ECRComponent} from "../../state/component/component";
import {WSCStructure} from "../../../typing/WSCStructure";
import {Constructor} from "../../../utility/types/constructor";
import {ECRRequest} from "../../query/query";

export type StoreQueryResult = Record<string, any>;

export interface StoreQuerySubscription {
    getCurrentData: () => StoreQueryResult,
}

export enum StoreComponentPurpose {
    HAS      = 0,
    HAS_NOT  = 1,
    NEEDED   = 2,
}

export class StoreComponentSelector<T extends ECRComponent> extends WSCStructure {
    constructor(
        readonly queryType: StoreComponentPurpose,
        readonly componentType: Constructor<T>,
    ) {
        super();
    }
}

export class StoreEntityRequest extends ECRRequest {
    constructor(
        readonly selectors: StoreComponentSelector<any>[]
    ) {
        super();
    }
}

export class StoreResourceRequest extends ECRRequest {
    constructor(
        readonly resourceName: string,
    ) {
        super();
    }
}

