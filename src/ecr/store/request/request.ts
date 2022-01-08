import {ECRComponent} from "../../state/component/component";
import {WSCStructure} from "../../../typing/WSCStructure";
import {Constructor} from "../../../utility/types/constructor";
import {ECRRequest} from "../../query/query";

export interface ECRStoreQuerySubscription {
    getCurrentData: () => Record<string, any>,
}

export enum ECRComponentStoreQueryType {
    HAS      = 0,
    HAS_NOT  = 1,
    NEEDED   = 2,
}

export class ECRComponentStoreSelector<T extends ECRComponent> extends WSCStructure {
    constructor(
        readonly queryType: ECRComponentStoreQueryType,
        readonly componentType: Constructor<T>,
    ) {
        super();
    }
}

export class ECREntityStoreRequest extends ECRRequest {
    constructor(
        readonly selectors: ECRComponentStoreSelector<any>[]
    ) {
        super();
    }
}

export class ECRResourceStoreRequest extends ECRRequest {
    constructor(
        readonly resourceName: string,
    ) {
        super();
    }
}

