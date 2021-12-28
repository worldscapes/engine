import {ECRCommand} from "../command/command";
import {ECRQuery} from "../query/query";
import {ECREntitySimulationRequest, ECRResourceSimulationRequest} from "../simulation/request/request";

export type ECRRuleCondition = () => boolean;
export type ECRRuleBody = (data: any) => ECRCommand[] | void;

export interface ECRRule {

    query: ECRQuery<ECREntitySimulationRequest | ECRResourceSimulationRequest>,
    condition: ECRRuleCondition,
    body: ECRRuleBody

}