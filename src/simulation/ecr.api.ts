import {ECRRule} from "./rule/rule";

export class ECR {

    protected rules: ECRRule[] = [];

    constructor() {}

    public addRule(rule: ECRRule) {
        this.rules.push(rule);
    }

}