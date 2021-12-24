import {WorldscapesServer} from "./server/worldscapes-server.api";
import {ECRCommand} from "./ecr/command/command";
import {createCommandHandler} from "./ecr/command/command-hander";
import {ECRComponent} from "./ecr/state/component/component";
import {ECRResource} from "./ecr/state/resource/resource";
import {CreateEntityCommand} from "./ecr/command/built-in/create-entity.command";
import {UpdateComponentCommand} from "./ecr/command/built-in/update-component.command";
import {DeleteEntityCommand} from "./ecr/command/built-in/delete-entity.command";
import {DeleteComponentCommand} from "./ecr/command/built-in/delete-component.command";
import {DeleteResourceCommand} from "./ecr/command/built-in/delete-resource.command";
import {UpdateResourceCommand} from "./ecr/command/built-in/update-resource.command";
import {AddResourceCommand} from "./ecr/command/built-in/add-resource.command";

export * from "./server/worldscapes-server.api";

class CustomCommand extends ECRCommand {}

class CustomComponent extends ECRComponent {
    constructor(
        readonly value: number
    ) {
        super();
    }
}

class CustomResource extends ECRResource {
    constructor(
        readonly timestamp: number,
        readonly deleteNextTick: boolean,
    ) {
        super();
    }
}

new WorldscapesServer()
    .addRule({ query: {}, condition: () => true, body: () => { return [ new CustomCommand() ]; } })
    .addCustomCommandHandler(createCommandHandler(CustomCommand, (command, store) => {
        const snapshot = store.getSnapshot();
        console.log(JSON.stringify(snapshot));

        return [
            ...(
                snapshot.entities.length < 2 ?
                    [
                        new CreateEntityCommand([ new CustomComponent(0) ]),
                        ...(snapshot.entities.length > 0 ?
                            [
                                new DeleteComponentCommand(
                                    snapshot.entities[snapshot.entities.length - 1].id,
                                    snapshot.components[snapshot.entities[snapshot.entities.length - 1].id]
                                        .find(component => component instanceof CustomComponent) as CustomComponent,
                                )
                            ]
                            : []
                        )
                    ]
                    :
                    [
                        new UpdateComponentCommand(
                            snapshot.entities[snapshot.entities.length - 1].id,
                            snapshot.components[snapshot.entities[snapshot.entities.length - 1].id]
                                .find(component => component instanceof CustomComponent) as CustomComponent,
                            new CustomComponent(Math.random() * 100)
                        ),
                        new DeleteEntityCommand(snapshot.entities[snapshot.entities.length - 2].id),
                    ]
            ),
            ...(
                snapshot.resources['TestResource'] ?
                    (snapshot.resources['TestResource'] as CustomResource).deleteNextTick ?
                        [
                            new DeleteResourceCommand("TestResource"),
                        ]
                        :
                        [
                            new UpdateResourceCommand("TestResource", new CustomResource(Date.now(), true))
                        ]
                    :
                    [
                        new AddResourceCommand("TestResource", new CustomResource(Date.now(), false)),
                    ]
            )
        ];
    }))
    .run();