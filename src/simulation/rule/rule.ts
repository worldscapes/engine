import {ECRCommand} from "../command/command";

export interface ECRRuleQuery {}

export type ECRRuleCondition = () => boolean;
export type ECRRuleBody = () => ECRCommand[];

export interface ECRRule {

    query: ECRRuleQuery,
    condition: ECRRuleCondition,
    body: ECRRuleBody

}