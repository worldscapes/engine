import {WSCStructure} from "../../../typing/WSCStructure";
import {Constructor} from "../../../utility/types/constructor";
import {ECRComponent} from "../../state/component/component";
import {ECRRequest} from "../../query/query";

export enum ComponentPurpose {
    HAS      = 0,
    HAS_NOT  = 1,
    CHECK    = 2,
    READ     = 3,
    WRITE    = 4,
}

export enum ResourcePurpose {
    CHECK    = 0,
    READ     = 1,
    WRITE    = 2,
}

export class ComponentSelector<T extends ECRComponent> extends WSCStructure {
    constructor(
        readonly queryType: ComponentPurpose,
        readonly componentType: Constructor<T>,
    ) {
        super();
    }
}

export class EntityRequest extends ECRRequest {
    constructor(
        readonly selectors: ComponentSelector<any>[]
    ) {
        super();
    }
}

export class ResourceRequest extends ECRRequest {
    constructor(
        readonly queryType: ResourcePurpose,
        readonly resourceName: string,
    ) {
        super();
    }
}


export type ECRSimulationQueryType = ComponentPurpose | ResourcePurpose;