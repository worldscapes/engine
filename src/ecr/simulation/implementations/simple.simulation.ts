import {ECRSimulation} from "../simulation.api";
import {ECRCommandHandler} from "../../command/command-hander";
import {ECRCommand} from "../../command/command";
import {ECRRule} from "../../rule/rule";
import {getClassName} from "../../../utility/functions/get-class-name";
import {createEntityHandler} from "../../command/built-in/create-entity.command";
import {deleteEntityHandler} from "../../command/built-in/delete-entity.command";
import {addComponentHandler} from "../../command/built-in/add-component.command";
import {updateComponentHandler} from "../../command/built-in/update-component.command";
import {deleteComponentHandler} from "../../command/built-in/delete-component.command";
import {addResourceHandler} from "../../command/built-in/add-resource.command";
import {updateResourceHandler} from "../../command/built-in/update-resource.command";
import {deleteResourceHandler} from "../../command/built-in/delete-resource.command";
import {ECRStore} from "../../store/store.api";

export class SimpleSimulation extends ECRSimulation {

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

    public startSimulation(store: ECRStore) {
        console.log("------------------");

        const handlerTypes = this.commandHandlers.map(handler => handler.commandType);

        this.rules.forEach(rule => {

            // Leave if condition is not fulfilled
            const conditionResult = rule.condition();
            if (!conditionResult) return;

            // Execute rule
            let commands = [...rule.body()];

            // Handle commands
            let i = 0;
            while (i < commands.length) {

                const command = commands[i];


                const commandHandlerId = handlerTypes.indexOf(getClassName(command));
                if (commandHandlerId !== -1) {
                    const returnedCommands = this.commandHandlers[commandHandlerId].effect(command, store);
                    if (returnedCommands && returnedCommands.length > 0) {
                        // Insert returned commands after current
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