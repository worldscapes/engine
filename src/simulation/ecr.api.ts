import {ECRRule} from "./rule/rule";
import {ECRCommandHandler} from "./command/command-hander";
import {ECRCommand} from "./command/command";
import {getClassName} from "../utility/functions/get-class-name";
import {ECRStore} from "./store/store.api";
import {SimpleStore} from "./store/implementations/simple.store";

export class ECR {

    protected rules: ECRRule[] = [];
    protected commandHandlers: ECRCommandHandler<any>[] = [];

    constructor(
        protected store: ECRStore = new SimpleStore()
    ) {}

    public runSimulation() {
        console.log("------------------");
        console.log("Running simulation");

        const handlerTypes = this.commandHandlers.map(handler => handler.commandType);
        console.log("Handler types", handlerTypes);

        this.rules.forEach(rule => {
            const commands = rule.body();
            commands.forEach(command => {
                const commandName = getClassName(command);
                const commandHandlerId = handlerTypes.indexOf(commandName);
                if (commandHandlerId != -1) {
                    this.commandHandlers[commandHandlerId].effect(command, this.store);
                }
            });
        });
    }

    public addRule(rule: ECRRule) {
        this.rules.push(rule);
    }

    public addCustomCommandHandler<T extends ECRCommand>(handler: ECRCommandHandler<T>) {
        this.commandHandlers.push(handler);
    }

}