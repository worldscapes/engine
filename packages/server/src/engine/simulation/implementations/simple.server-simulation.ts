import {
  createCommandHandler,
  ECRApi,
  ECRCommand,
  ECRCommandHandler,
  ECRResource,
  ECRTickResult,
  StoreResourceRequest,
  UpdateResourceCommand,
  UserAction,
  UserId,
  getObjectType, Constructor, WSCStructure,
} from "@worldscapes/common";
import { ServerSimulationApi } from "../server-simulation.api";

class AddInputCommand extends ECRCommand {
  constructor(
    readonly userInput: Record<string, Record<UserId, UserAction[]>>
  ) {
    super();
  }
}

export class UserActionResource<
  T extends UserAction = UserAction
> extends ECRResource {
  constructor(readonly actions: Record<UserId, UserAction[]>) {
    super();
  }
}

export function getActionResourceName(action: UserAction | Constructor<UserAction> | string): string {
  if (typeof action === "string") {
    return "action_" + action;
  } else if (action['name']) {
    return "action_" + (action as Constructor<UserAction>).name;
  } else {
    return "action_" + getObjectType(action as WSCStructure);
  }
}

export class SimpleServerSimulation extends ServerSimulationApi {
  constructor(protected ecr: ECRApi) {
    super();

    ecr.addCustomCommandHandler(
      createCommandHandler(AddInputCommand, (command, store) => {
        const resultCommands: ECRCommand[] = [];

        Object.entries(command.userInput).forEach(
          ([actionName, userActions]) => {
            const oldResource = store.executeQuery({
              entity: {},
              resource: {
                oldResource: new StoreResourceRequest<UserActionResource>(
                  getActionResourceName(actionName)
                ),
              },
            }).resource.oldResource;

            let newActions;
            if (oldResource) {
              newActions = Object.keys(userActions).reduce(
                (allActions, userId) => {
                  return {
                    ...allActions,
                    [userId]: [
                      ...(allActions[userId] ?? []),
                      ...userActions[userId],
                    ],
                  };
                },
                oldResource?.actions
              );
            } else {
              newActions = userActions;
            }

            const newResource = new UserActionResource(newActions);

            resultCommands.push(
              new UpdateResourceCommand(
                getActionResourceName(actionName),
                newResource
              )
            );
          }
        );

        return resultCommands;
      })
    );
  }

  runSimulationTick(): ECRTickResult {
    return this.ecr.runSimulationTick();
  }

  addCustomCommandHandler(handler: ECRCommandHandler): void {
    this.ecr.addCustomCommandHandler(handler);
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

    this.ecr.injectCommands([new AddInputCommand(processedInput)]);
  }
}
