import {ECRCommand} from "../command/command";
import {ECRQuery} from "../query/query";
import {EntityRequest, ResourceRequest} from "../simulation/request/request";

export type ECRRuleCondition = (data: any) => boolean;
export type ECRRuleBody = (data: any) => ECRCommand[] | void;

export interface ECRRule {

    query: ECRQuery<EntityRequest | ResourceRequest>,
    condition: ECRRuleCondition,
    body: ECRRuleBody

}