import {ECRRule} from "./rule/rule";
import {ECRCommandHandler} from "./command/command-hander";
import {ECRCommand} from "./command/command";
import {getClassName} from "../utility/functions/get-class-name";
import {ECRStore} from "./store/store.api";
import {SimpleStore} from "./store/implementations/simple.store";
import {addComponentHandler} from "./command/built-in/add-component.command";
import {addResourceHandler} from "./command/built-in/add-resource.command";
import {createEntityHandler} from "./command/built-in/create-entity.command";
import {updateResourceHandler} from "./command/built-in/update-resource.command";
import {updateComponentHandler} from "./command/built-in/update-component.command";
import {deleteComponentHandler} from "./command/built-in/delete-component.command";
import {deleteResourceHandler} from "./command/built-in/delete-resource.command";
import {deleteEntityHandler} from "./command/built-in/delete-entity.command";
export class ECR {

    protected builtInCommandHandlers: ECRCommandHandler<any>[] = [
        createEntityHandler,
        deleteEntityHandler,

        addComponentHandler,
        updateComponentHandler,
        deleteComponentHandler,

        addResourceHandler,
        updateResourceHandler,
        deleteResourceHandler,
    ];

    protected rules: ECRRule[] = [];
    protected commandHandlers: ECRCommandHandler<any>[] = [
        ...this.builtInCommandHandlers
    ];

    constructor(
        protected store: ECRStore = new SimpleStore()
    ) {}

    public runSimulation() {
        console.log("------------------");

        const handlerTypes = this.commandHandlers.map(handler => handler.commandType);

        this.rules.forEach(rule => {
            let commands = [...rule.body()];
            let i = 0;
            while (i < commands.length) {
                const command = commands[i];
                const commandName = getClassName(command);
                const commandHandlerId = handlerTypes.indexOf(commandName);
                if (commandHandlerId != -1) {
                    const returnedCommands = this.commandHandlers[commandHandlerId].effect(command, this.store);
                    if (returnedCommands && returnedCommands.length > 0) {
                        // Insert after current command
                        commands = [ ...commands.slice(0, i + 1), ...returnedCommands, ...commands.slice(i + 1, commands.length) ];
                    }
                }
                i++;
            }
        });
    }

    public addRule(rule: ECRRule) {
        this.rules.push(rule);
    }

    public addCustomCommandHandler<T extends ECRCommand>(handler: ECRCommandHandler<T>) {
        this.commandHandlers.push(handler);
    }

}