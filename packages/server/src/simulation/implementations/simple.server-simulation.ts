import {
  createCommandHandler,
  ECRApi,
  ECRCommand,
  ECRCommandHandler,
  ECRTickResult,
  PlayerAction,
  PlayerId,
  PlayerInfo,
  PlayerComponent,
  OwnedComponent,
  AddComponentCommand,
  DeleteComponentCommand,
} from "@worldscapes/common";
import { ServerSimulationApi } from "../server-simulation.api";

class AddInputCommand extends ECRCommand {
  constructor(
    readonly playerInput: Record<PlayerId, PlayerAction[]>[]
  ) {
    super();
  }
}

class CleanInputCommand extends ECRCommand {
  constructor(
      readonly playerInput: Record<PlayerId, PlayerAction[]>[]
  ) {
    super();
  }
}

class CreatePlayerEntitiesCommand extends ECRCommand {
  constructor(
      readonly players: PlayerInfo[]
  ) {
    super();
  }
}

export class SimpleServerSimulation extends ServerSimulationApi {

  protected accumulatedInput: Record<PlayerId, PlayerAction[]>[] = [];

  protected entityIds = new Map<PlayerId, string>();

  constructor(
      protected ecr: ECRApi,
      protected players: PlayerInfo[]
  ) {
    super();

    // Setup Player Entities
    ecr.addCustomCommandHandler(
      createCommandHandler(CreatePlayerEntitiesCommand, (command, store) => {
        command.players.forEach(playerInfo => {
          const entityId = store.createEntity();
          store.addComponent(entityId, new PlayerComponent());
          store.addComponent(entityId, new OwnedComponent(playerInfo.id));
          this.entityIds[playerInfo.id] = entityId;
        });
      })
    );
    ecr.injectCommands([ new CreatePlayerEntitiesCommand(players) ]);

    // Setup Input addition
    ecr.addCustomCommandHandler(
      createCommandHandler(AddInputCommand,  (command, store) => {
        const resultCommands: ECRCommand[] = [];

        // Attach new input
        if (command.playerInput.length > 0) {
          command.playerInput.forEach(inputPack => {
            if (!inputPack) {
              return;
            }
            Object.entries(inputPack).forEach(([playerId, playerActions]) => {
              const entityId = this.entityIds[playerId];

              resultCommands.push(
                  ...playerActions.map(action => new AddComponentCommand(entityId, action))
              );
            });
          });
        }

        return resultCommands;
      })
    );

    // Setup Input cleaning
    ecr.addCustomCommandHandler(
        createCommandHandler(CleanInputCommand,  (command, store) => {
          const resultCommands: ECRCommand[] = [];

          // Attach new input
          if (command.playerInput.length > 0) {
            command.playerInput.forEach(inputPack => {
              if (!inputPack) {
                return;
              }
              Object.entries(inputPack).forEach(([playerId, playerActions]) => {
                const entityId = this.entityIds[playerId];

                resultCommands.push(
                    ...playerActions.map(action => new DeleteComponentCommand(entityId, action))
                );
              });
            });
          }

          return resultCommands;
        })
    );
  }

  runSimulationTick(): ECRTickResult {
    this.attachInput(this.accumulatedInput);

    const simulationResult = this.ecr.runSimulationTick();

    this.cleanInput(this.accumulatedInput);
    this.accumulatedInput = [];

    return simulationResult;
  }

  addCustomCommandHandler(handler: ECRCommandHandler): void {
    this.ecr.addCustomCommandHandler(handler);
  }

  handleUserInput(input: Record<PlayerId, PlayerAction[]>): void {
    this.accumulatedInput.push(input);
  }

  protected attachInput(input: Record<PlayerId, PlayerAction[]>[]): void {
    this.ecr.injectCommands([ new AddInputCommand(input) ]);
  }

  protected cleanInput(input: Record<PlayerId, PlayerAction[]>[]): void {
    this.ecr.injectCommands([ new CleanInputCommand(input) ]);
  }
}
