import {WSCStructure} from "../../../typing/WSCStructure";
import {Constructor} from "../../../utility/types/constructor";
import {ECRComponent} from "../../state/component/component";
import {ECRRequest} from "../../query/query";

export enum ECRComponentSimulationQueryType {
    HAS      = 0,
    HAS_NOT  = 1,
    CHECK    = 2,
    READ     = 3,
    WRITE    = 4,
}

export enum ECRResourceSimulationQueryType {
    CHECK    = 0,
    READ     = 1,
    WRITE    = 2,
}

export class ECRComponentSimulationSelector<T extends ECRComponent> extends WSCStructure {
    constructor(
        readonly queryType: ECRComponentSimulationQueryType,
        readonly componentType: Constructor<T>,
    ) {
        super();
    }
}

export class ECREntitySimulationRequest extends ECRRequest {
    constructor(
        readonly selectors: ECRComponentSimulationSelector<any>[]
    ) {
        super();
    }
}

export class ECRResourceSimulationRequest extends ECRRequest {
    constructor(
        readonly queryType: ECRResourceSimulationQueryType,
        readonly resourceName: string,
    ) {
        super();
    }
}


export type ECRSimulationQueryType = ECRComponentSimulationQueryType | ECRResourceSimulationQueryType;