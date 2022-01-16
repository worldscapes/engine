import {ECRCommand} from "./ecr/command/command";
import {ECRComponent} from "./ecr/state/component/component";
import {ECRResource} from "./ecr/state/resource/resource";
import {
    ECRComponentSimulationQueryType,
    ECRComponentSimulationSelector,
    ECREntitySimulationRequest
} from "./ecr/simulation/request/request";
import {ECRApi} from "./ecr/ecr.api";
import {SimpleSimulation, WorldStateSnapshot} from "./ecr/simulation/implementations/simple.simulation";
import {CreateEntityCommand} from "./ecr/command/built-in/create-entity.command";
import {UpdateComponentCommand} from "./ecr/command/built-in/update-component.command";
import {WebsocketServerNetworkAdapter} from "./network/adapter/implementations/websocket/websocket-server.adapter";
import {WebsocketClientNetworkAdapter} from "./network/adapter/implementations/websocket/websocket-client.adapter";
import {SimpleEngineClient} from "./engine/client/implementations/simple.client";
import {SimpleEngineServer} from "./engine/server/implementations/simple.server";
import {SimpleNetworkClient} from "./network/client/implementations/client.network";
import {SimpleNetworkServer} from "./network/server/implementations/server.network";

export * from "./engine/server/worldscapes-server.api";

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

class TreeTrunk extends ECRComponent {
    constructor(
        readonly trunkSize: number
    ) {
        super();
    }
}

class CardShuffle extends ECRComponent {
    constructor(
        readonly cards: any[] = []
    ) {
        super();
    }
}

let testCards = [
    {
        name: "six",
        value: 1
    },
    {
        name: "eight",
        value: 3
    },
    {
        name: "seven",
        value: 2
    }
]

const createCardCollection = {
    query: {
        cards: new ECREntitySimulationRequest([
            new ECRComponentSimulationSelector(ECRComponentSimulationQueryType.CHECK, CardShuffle)
        ])
    },
    condition: ({ cards }) => cards.length < 3,
    body: () => {
        return [ new CreateEntityCommand([ new CardShuffle([ ...testCards ]) ]) ];
    }
}

const shuffleCardCollection = {
    query: {
        cards: new ECREntitySimulationRequest([
            new ECRComponentSimulationSelector(ECRComponentSimulationQueryType.WRITE, CardShuffle)
        ])
    },
    condition: ({ cards }) => {
        return cards.length > 0
    },
    body: (entities) => {
        return entities.cards.map((entity, index) => {
            const shuffle = entity
                .find(component => component instanceof CardShuffle);
            return new UpdateComponentCommand(
                index + 1,
                shuffle,
                new CardShuffle(
                    [ ...shuffle.cards ].sort(
                        (card1, card2) => card1.value - card2.value
                    )
                )
            )
        });
    }
}

const createTreeRule = {
    query: {
        tree: new ECREntitySimulationRequest([
            new ECRComponentSimulationSelector(ECRComponentSimulationQueryType.CHECK, TreeTrunk)
        ]),
    },
    condition: ({ tree }) => tree.length === 0,
    body: () => {
        return [ new CreateEntityCommand([ new TreeTrunk(1) ]) ];
    },
};

const growTreeRule = {
    query: {
        tree: new ECREntitySimulationRequest([
            new ECRComponentSimulationSelector(ECRComponentSimulationQueryType.WRITE, TreeTrunk)
        ]),
    },
    condition: ({ tree }) => tree.length > 0,
    body: ({ tree }) => {
        return [ new UpdateComponentCommand(1, tree[0][0], new TreeTrunk(tree[0][0].trunkSize + 1)) ];
    },
};


const simulation = new SimpleSimulation()
    .addRule(createTreeRule)
    .addRule(growTreeRule);


const simulation2 = new SimpleSimulation()
    .addRule(shuffleCardCollection)
    .addRule(createCardCollection);

    // .addRule({
    //     query: {},
    //     condition: () => true,
    //     body: (data) => {
    //         const chance = Math.random() * 100;
    //         if (chance < 50) {
    //             return [ new CreateEntityCommand([ new CustomComponent(chance) ]) ]
    //         } else {
    //             return [ new CreateEntityCommand([ new CustomComponent(chance), new CustomComponent2(chance) ]) ]
    //         }
    //     }
    // })
    // .addRule({
    //     query: {
    //         customComponents: new ECREntitySimulationRequest([
    //             new ECRComponentSimulationSelector(ECRComponentSimulationQueryType.READ, CustomComponent),
    //             new ECRComponentSimulationSelector(ECRComponentSimulationQueryType.READ, CustomComponent2)
    //         ])
    //     },
    //     condition: () => true,
    //     body: (data) => {
    //         console.log(JSON.stringify(data));
    //     }
    // })
    // .addRule({
    //     query: {
    //         customComponentsWithHasNot: new ECREntitySimulationRequest([
    //             new ECRComponentSimulationSelector(ECRComponentSimulationQueryType.READ, CustomComponent),
    //             new ECRComponentSimulationSelector(ECRComponentSimulationQueryType.HAS_NOT, CustomComponent2)
    //         ])
    //     },
    //     condition: () => true,
    //     body: (data) => {
    //         console.log(JSON.stringify(data));
    //     }
    // });

// const serverAdapter = new LocalServerNetworkAdapter();
// const clientAdapter = new LocalClientNetworkAdapter(serverAdapter);

const serverAdapter = new WebsocketServerNetworkAdapter();
const clientAdapter = new WebsocketClientNetworkAdapter('localhost');

async function init() {

    await serverAdapter.isReady();
    await clientAdapter.isReady();

    // serverAdapter.sendMessageByRank('client', JSON.stringify({someTestMessage: 1}));
    // clientAdapter.sendMessageByRank('server', JSON.stringify({someTestMessage: 1}));

    new SimpleEngineServer(
        new ECRApi(simulation2),
        new SimpleNetworkServer(serverAdapter),
    ).start();

    new SimpleEngineClient(
        new SimpleSimulation(),
        new SimpleNetworkClient(clientAdapter),
        {
            onInput: () => {},
            takeUpdatedSnapshot(snapshot: WorldStateSnapshot) {
                console.log('------------------------');
                console.log(snapshot);
            }
        }
    ).start();
}

init();
