import {ECRApi} from "./ecr.api";
import {ECRSimulationApi} from "./simulation/simulation.api";
import {ECRRule} from "./rule/rule";
import {createCommandHandler, ECRCommandHandler} from "./command/command-hander";
import {ECRCommand} from "./command/command";
import {UserAction} from "../display/display.api";
import {getObjectType} from "../typing/WSCStructure";
import {StoreResourceRequest} from "./store/request/request";
import {UpdateResourceCommand} from "./command/built-in/update-resource.command";
import {UserActionResource} from "./built-in/resource/UserActionResource";
import {UserId} from "../network/adapter/adapter.api";

class AddInputCommand extends ECRCommand {
    constructor(
        readonly userInput: Record<string, Record<UserId, UserAction[]>>
    ) {
        super();
    }
}

export class SimpleECR extends ECRApi {

    constructor(
        protected simulation: ECRSimulationApi
    ) {
        super();

        simulation.addCustomCommandHandler(createCommandHandler(
            AddInputCommand,
            (command, store) => {
                const resultCommands: ECRCommand[] = []

                Object.entries(command.userInput).forEach(([actionName, userActions]) => {
                    const oldResource = store.executeQuery({
                        entity: {},
                        resource: {
                            oldResource: new StoreResourceRequest<UserActionResource<any>>(this.actionResourceName(actionName)),
                        }
                    }).resource.oldResource;

                    let newActions;
                    if (oldResource) {
                        newActions = Object.keys(userActions).reduce(
                            (allActions, userId) => {
                                return {
                                    ...allActions,
                                    [userId]: [
                                        ...allActions[userId],
                                        ...userActions[userId]
                                    ]
                                }
                            },
                            oldResource?.actions
                        )
                    } else {
                        newActions = userActions;
                    }

                    const newResource = new UserActionResource(newActions);

                    resultCommands.push(new UpdateResourceCommand(this.actionResourceName(actionName), newResource));
                });

                return resultCommands;
            }
        ));
    }

    runSimulationTick() {
        return this.simulation.runSimulationTick();
    }

    addRule(rule: ECRRule<any>) {
        this.simulation.addRule(rule);
    }

    addCustomCommandHandler<T extends ECRCommand>(handler: ECRCommandHandler<T>) {
        this.simulation.addCustomCommandHandler(handler);
    }

    handleUserInput(input: Record<UserId, UserAction[]>): void {
        if (Object.keys(input).length === 0) {
            return;
        }

        const processedInput: Record<string, Record<UserId, UserAction[]>> = {};

        const playerIds = Object.keys(input);

        for (let i = 0; i < playerIds.length; i++) {
            const currentPlayerId = playerIds[i];
            const playerActions = input[currentPlayerId];

            for (let j = 0; j < playerActions.length; j++) {
                const currentAction = playerActions[j];

                processedInput[getObjectType(currentAction)] = processedInput[getObjectType(currentAction)] ?? [];
                processedInput[getObjectType(currentAction)][currentPlayerId] = processedInput[getObjectType(currentAction)][currentPlayerId] ?? [];
                processedInput[getObjectType(currentAction)][currentPlayerId].push(currentAction);
            }
        }

        this.simulation.injectCommands([ new AddInputCommand(processedInput) ]);
    }

    protected actionResourceName(action: UserAction | string): string {
        if (typeof action !== 'string') {
            return "action_" + getObjectType(action);
        } else {
            return "action_" + action;
        }
    }
}