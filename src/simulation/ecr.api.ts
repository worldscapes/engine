import {ECRRule} from "./rule/rule";
import {ECRCommandHandler} from "./command/command-hander";
import {ECRCommand} from "./command/command";

export class ECR {

    protected rules: ECRRule[] = [];
    protected commandHandlers: ECRCommandHandler<any>[] = [];

    constructor() {}

    public addRule(rule: ECRRule) {
        this.rules.push(rule);
    }

    public addCustomCommandHandler<T extends ECRCommand>(handler: ECRCommandHandler<T>) {
        this.commandHandlers.push(handler);
    }

}