import { ECRCommand } from "../command/command";
import {
  ECRQuery,
  ECRQueryResult,
  ReadComponentPurpose,
  WriteComponentPurpose,
  CheckResourcePurpose,
  ReadResourcePurpose,
  WriteResourcePurpose,
  CheckComponentPurpose,
} from "../ecr/request/request";

export const ConditionPurposes = [
  CheckComponentPurpose,
  ReadComponentPurpose,
  WriteComponentPurpose,
  CheckResourcePurpose,
  ReadResourcePurpose,
  WriteResourcePurpose,
] as const;

export const BodyPurposes = [
  ReadComponentPurpose,
  WriteComponentPurpose,
  ReadResourcePurpose,
  WriteResourcePurpose,
] as const;

export type ECRRuleCondition<Query extends ECRQuery> = (
  data: ECRQueryResult<Query, InstanceType<typeof ConditionPurposes[number]>>
) => boolean;

export type ECRRuleBody<Query extends ECRQuery> = (
  data: ECRQueryResult<Query, InstanceType<typeof BodyPurposes[number]>>
) => ECRCommand[] | void;

export interface ECRRule<QueryType extends ECRQuery = ECRQuery> {
  query: QueryType;
  condition: ECRRuleCondition<QueryType>;
  body: ECRRuleBody<QueryType>;
}
export namespace ECRRule {
  export function create<T extends ECRQuery>(rule: ECRRule<T>): ECRRule<T> {
    return rule;
  }
}
