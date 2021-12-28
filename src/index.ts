import {WorldscapesServer} from "./server/worldscapes-server.api";
import {ECRCommand} from "./ecr/command/command";
import {ECRComponent} from "./ecr/state/component/component";
import {ECRResource} from "./ecr/state/resource/resource";
import {CreateEntityCommand} from "./ecr/command/built-in/create-entity.command";
import {ECRComponentSimulationQueryType, ECRComponentSimulationSelector, ECREntitySimulationRequest} from "./ecr/simulation/request/request";

export * from "./server/worldscapes-server.api";

class CustomCommand extends ECRCommand {}

class CustomComponent extends ECRComponent {
    constructor(
        readonly value: number
    ) {
        super();
    }
}

class CustomComponent2 extends ECRComponent {
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

    .addRule({
        query: {},
        condition: () => true,
        body: (data) => {
            const chance = Math.random() * 100;
            if (chance < 50) {
                return [ new CreateEntityCommand([ new CustomComponent(chance) ]) ]
            } else {
                return [ new CreateEntityCommand([ new CustomComponent(chance), new CustomComponent2(chance) ]) ]
            }
        }
    })

    .addRule({
        query: {
            customComponents: new ECREntitySimulationRequest([
                new ECRComponentSimulationSelector(ECRComponentSimulationQueryType.READ, CustomComponent),
                new ECRComponentSimulationSelector(ECRComponentSimulationQueryType.READ, CustomComponent2)
            ])
        },
        condition: () => true,
        body: (data) => {
            console.log(JSON.stringify(data));
        }
    })

    .addRule({
        query: {
            customComponentsWithHasNot: new ECREntitySimulationRequest([
                new ECRComponentSimulationSelector(ECRComponentSimulationQueryType.READ, CustomComponent),
                new ECRComponentSimulationSelector(ECRComponentSimulationQueryType.HAS_NOT, CustomComponent2)
            ])
        },
        condition: () => true,
        body: (data) => {
            console.log(JSON.stringify(data));
        }
    })

    .run();