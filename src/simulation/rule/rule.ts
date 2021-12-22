export interface ECRRuleQuery {}

export type ECRRuleCondition = () => boolean;
export type ECRRuleBody = () => void;

export interface ECRRule {

    query: ECRRuleQuery,
    condition: ECRRuleCondition,
    body: ECRRuleBody

}