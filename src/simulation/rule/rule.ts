export interface RuleQuery {}

export type RuleCondition = () => {};
export type RuleBody = () => {};

export interface Rule {

    query: RuleQuery,
    condition: RuleCondition,
    body: RuleBody

}