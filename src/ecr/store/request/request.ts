import { ECRComponent } from "../../state/component/component";
import { WSCStructure } from "../../../typing/WSCStructure";
import { Constructor } from "../../../utility/types/constructor";
import { ECRResource } from "../../state/resource/resource";
import { IPurpose } from "../../ecr/request/request";

export type StoreQuery = {
  entity: { [key: string]: StoreEntityRequest };
  resource: { [key: string]: StoreResourceRequest };
};

export namespace StoreQuery {
  export type RequestTypes = StoreEntityRequest | StoreResourceRequest;
  export function create<T extends StoreQuery>(query: T): T {
    return query;
  }
}

export type StoreQueryResult<
  QueryType extends StoreQuery,
  AllowedPurposes extends IStorePurpose
> = {
  entity: {
    [EntityKey in keyof QueryType["entity"]]: StoreEntityRequest.Result<{
      typeChain: QueryType["entity"][EntityKey]["typeChain"];
      selectors: {
        [SelectorKey in keyof QueryType["entity"][EntityKey]["selectors"] as Exclude<
          SelectorKey,
          InstanceType<
            QueryType["entity"][EntityKey]["selectors"][SelectorKey]["queryType"]
          > extends AllowedPurposes
            ? never
            : SelectorKey
        >]: QueryType["entity"][EntityKey]["selectors"][SelectorKey];
      };
    }>;
  };
  resource: {
    [ResourceKey in keyof QueryType["resource"]]: StoreResourceRequest.Result<
      QueryType["resource"][ResourceKey]
    >;
  };
};

export abstract class StoreRequest extends WSCStructure {}

export interface StoreQuerySubscription<T extends StoreQuery = StoreQuery> {
  getCurrentData: () => StoreQueryResult<T, StoreReturnComponentPurpose>;
}
export class IStorePurpose extends IPurpose {
  readonly purposeKey!: `store-${string}`;
}
export class IStoreComponentPurpose extends IStorePurpose {
  readonly purposeKey!: `store-${string}-component`;
}
export class StoreHasComponentPurpose implements IStoreComponentPurpose {
  readonly purposeKey!: "store-has-component";
}
export class StoreHasNotComponentPurpose implements IStoreComponentPurpose {
  readonly purposeKey!: "store-has-not-component";
}
export class StoreReturnComponentPurpose implements IStoreComponentPurpose {
  readonly purposeKey!: "store-return-component";
}
export const StoreComponentPurposes = {
  HAS: StoreHasComponentPurpose,
  HAS_NOT: StoreHasNotComponentPurpose,
  RETURN: StoreReturnComponentPurpose,
};

export class StoreComponentSelector<
  T extends ECRComponent = ECRComponent,
  P extends typeof IStoreComponentPurpose = typeof IStoreComponentPurpose
> extends WSCStructure {
  constructor(readonly queryType: P, readonly componentType: Constructor<T>) {
    super();
  }
}
export namespace StoreComponentSelector {
  export type InferComponentType<T extends StoreComponentSelector> =
    T extends StoreComponentSelector<infer R, never> ? R : never;
  export type InferPurpose<T extends StoreComponentSelector> =
    T extends StoreComponentSelector<never, infer R> ? R : never;
}

export class StoreEntityRequest<
  SelectorsType extends { [key: string]: StoreComponentSelector } = {
    [key: string]: StoreComponentSelector;
  }
> extends StoreRequest {
  constructor(readonly selectors: SelectorsType) {
    super();
  }
}
export namespace StoreEntityRequest {
  export type InferSelector<T extends StoreEntityRequest> =
    T extends StoreEntityRequest<infer R> ? R : never;
  export type Result<T extends StoreEntityRequest> =
    keyof T["selectors"] extends never
      ? never
      : ({ entityId: number } & {
          [Key in keyof T["selectors"]]: StoreComponentSelector.InferComponentType<
            T["selectors"][Key]
          >;
        })[];
}

export class StoreResourceRequest<
  ResourceType extends ECRResource = ECRResource
> extends StoreRequest {
  constructor(readonly resourceName: string) {
    super();
  }
}
export namespace StoreResourceRequest {
  export type Result<T extends StoreResourceRequest> =
    T extends StoreResourceRequest<infer R> ? R | undefined : never;
}
