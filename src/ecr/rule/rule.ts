import {ECRCommand} from "../command/command";
import {
    SimulationQuery,
    ExtractSimulationQueryResult,
    ReadComponentPurpose,
    WriteComponentPurpose, CheckResourcePurpose, ReadResourcePurpose, WriteResourcePurpose, CheckComponentPurpose,
} from "../simulation/request/request";

export const ConditionPurposes = [ CheckComponentPurpose, ReadComponentPurpose, WriteComponentPurpose, CheckResourcePurpose, ReadResourcePurpose, WriteResourcePurpose] as const;
export type ECRRuleCondition<Query extends SimulationQuery> = (data: ExtractSimulationQueryResult<Query, InstanceType<typeof ConditionPurposes[number]>>) => boolean;


export const BodyPurposes = [ ReadComponentPurpose, WriteComponentPurpose, ReadResourcePurpose, WriteResourcePurpose] as const;
export type ECRRuleBody<Query extends SimulationQuery> = (data: ExtractSimulationQueryResult<Query, InstanceType<typeof BodyPurposes[number]>>) => ECRCommand[] | void;

export interface ECRRule<QueryType extends SimulationQuery> {
    query: QueryType,
    condition: ECRRuleCondition<QueryType>,
    body: ECRRuleBody<QueryType>
}
export namespace ECRRule {
    export function create<T extends SimulationQuery>(rule: ECRRule<T>) {
        return rule;
    }
}

