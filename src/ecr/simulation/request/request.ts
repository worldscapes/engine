import {WSCStructure} from "../../../typing/WSCStructure";
import {Constructor} from "../../../utility/types/constructor";
import {ECRComponent} from "../../state/component/component";
import {ECRResource} from "../../state/resource/resource";


export type SimulationQuery = {
    entity: { [key: string]: EntityRequest<any> }
    resource: { [ key: string ]: ResourceRequest<any, any> }
};
export namespace SimulationQuery {
    export function create<T extends SimulationQuery>(query: T) {
        return query;
    }
}

export type ExtractSimulationQueryResult<
    QueryType extends SimulationQuery,
    AllowedRequestPurpose extends IPurpose
> = {

    entity: {
        [RequestKey in keyof QueryType['entity']]: EntityRequest.Result<{
            typeChain: QueryType['entity'][RequestKey]['typeChain'],
            selectors: {
                [SelectorKey in keyof QueryType['entity'][RequestKey]['selectors'] as Exclude<
                    SelectorKey,
                    InstanceType<QueryType['entity'][RequestKey]['selectors'][SelectorKey]['queryType']> extends AllowedRequestPurpose ?
                        never
                        :
                        SelectorKey
                >]: QueryType['entity'][RequestKey]['selectors'][SelectorKey]
            }
        }>
    },

    resource: {
        [RequestKey in keyof QueryType['resource']]: InstanceType<QueryType['resource'][RequestKey]['queryType']> extends AllowedRequestPurpose ?
            ResourceRequest.Result<QueryType['resource'][RequestKey]>
            :
            never
    }
};

export type SimulationQueryResult<QueryType extends SimulationQuery> = {
    [ RequestKey in keyof QueryType ]:

        QueryType[RequestKey] extends EntityRequest<any> ? EntityRequest.Result<QueryType[RequestKey]>

        : QueryType[RequestKey] extends ResourceRequest<any, any> ? ResourceRequest.Result<QueryType[RequestKey]>

        : never
}

export abstract class RuleRequest extends WSCStructure {}

export class IPurpose {
    readonly purposeKey;
}

export class IComponentPurpose extends IPurpose {}
export class CheckComponentPurpose extends IComponentPurpose {
    readonly purposeKey!: 'check-component'
}
export class ReadComponentPurpose extends IComponentPurpose {
    readonly purposeKey!: 'read-component'
}
export class WriteComponentPurpose extends IComponentPurpose {
    readonly purposeKey!: 'write-component'
}
export class HasComponentPurpose extends IComponentPurpose {
    readonly purposeKey!: 'has-component'
}
export class HasNotComponentPurpose extends IComponentPurpose {
    readonly purposeKey!: 'has-not-component'
}
export const ComponentPurposes = {
    CHECK: CheckComponentPurpose,
    READ: ReadComponentPurpose,
    WRITE: WriteComponentPurpose,
    HAS: HasComponentPurpose,
    HAS_NOT: HasNotComponentPurpose,
}

export class IResourcePurpose extends IPurpose {}
export class CheckResourcePurpose extends IResourcePurpose {
    readonly purposeKey!: 'check-resource'
}
export class ReadResourcePurpose extends IResourcePurpose {
    readonly purposeKey!: 'read-resource'
}
export class WriteResourcePurpose extends IResourcePurpose {
    readonly purposeKey!: 'write-resource'
}
export const ResourcePurposes = {
    CHECK: CheckResourcePurpose,
    READ: ReadResourcePurpose,
    WRITE: WriteResourcePurpose,
}


export class ComponentSelector<
    ComponentType extends ECRComponent,
    QueryType extends typeof IComponentPurpose
> extends WSCStructure {
    constructor(
        readonly queryType: QueryType,
        readonly componentType: Constructor<ComponentType>,
    ) {
        super();
    }
}
export namespace ComponentSelector {
    export type InferComponentType<T extends ComponentSelector<any, any>> = T extends ComponentSelector<infer R, any> ? R : never;
}




export class EntityRequest<SelectorsType extends { [ key: string ]: ComponentSelector<any, any> }> extends RuleRequest {
    constructor(
        readonly selectors: SelectorsType
    ) {
        super();
    }
}
export namespace EntityRequest {
    export type InferSelector<T extends EntityRequest<any>> = T extends EntityRequest<infer R> ? R : never;
    export type Result<T extends EntityRequest<any>> = keyof T['selectors'] extends never ?
        never
        :
        { [Key in keyof T['selectors']]: ComponentSelector.InferComponentType<T['selectors'][Key]> }[];
}




export class ResourceRequest<
    ResourceType extends ECRResource,
    QueryType extends typeof IResourcePurpose
> extends RuleRequest {
    constructor(
        readonly queryType: QueryType,
        readonly resourceName: string,
    ) {
        super();
    }
}
export namespace ResourceRequest {
    export type Result<T extends ResourceRequest<any, any>> = T extends ResourceRequest<infer R, any> ? R | undefined : never;
}