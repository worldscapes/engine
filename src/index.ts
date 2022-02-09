import {ECRCommand} from "./ecr/command/command";
import {ECRComponent} from "./ecr/state/component/component";
import {ECRResource} from "./ecr/state/resource/resource";
import {
    ComponentPurpose,
    ComponentSelector,
    EntityRequest,
    ResourcePurpose,
    ResourceRequest
} from "./ecr/simulation/request/request";
import {SimpleSimulation, WorldStateSnapshot} from "./ecr/simulation/implementations/simple.simulation";
import {CreateEntityCommand} from "./ecr/command/built-in/create-entity.command";
import {UpdateComponentCommand} from "./ecr/command/built-in/update-component.command";
import {WebsocketServerNetworkAdapter} from "./network/adapter/implementations/websocket/websocket-server.adapter";
import {WebsocketClientNetworkAdapter} from "./network/adapter/implementations/websocket/websocket-client.adapter";
import {SimpleEngineClient} from "./engine/client/implementations/simple.client";
import {SimpleEngineServer} from "./engine/server/implementations/simple.server";
import {DisplayApi, UserAction} from "./display/display.api";
import {SimpleNetworkServer} from "./network/server/implementations/simple.server-network";
import {SimpleNetworkClient} from "./network/client/implementations/simple.client-network";
import {SimpleECR} from "./ecr/simple-ecr.api";
import {getTypeName} from "./typing/WSCStructure";

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

class AddOneCardAction extends UserAction {

}

let testCards = [
    {
        name: "six",
        value: 1
    },
    {
        name: "seven",
        value: 2
    },
    {
        name: "eight",
        value: 3
    },
    {
        name: "nine",
        value: 4
    },
    {
        name: "ten",
        value: 5
    },
]

const createCardCollection = {
    query: {
        cardEntities: new EntityRequest([
            new ComponentSelector(ComponentPurpose.CHECK, CardShuffle)
        ])
    },
    condition: ({ cardEntities }) => cardEntities.length < 1,
    body: () => {
        return [ new CreateEntityCommand([ new CardShuffle([]) ]) ];
    }
}

const addOneCardOnInput = {
    query: {
        addOneActions: new ResourceRequest(ResourcePurpose.CHECK, "action_" + getTypeName(AddOneCardAction)),
        shuffles: new EntityRequest([
            new ComponentSelector(ComponentPurpose.WRITE, CardShuffle)
        ])
    },
    condition: ({ addOneActions, shuffles }) => {
        return addOneActions?.actions && shuffles?.length > 0
    },
    body: ({ shuffles }) => {
        const randomCard = testCards[Math.floor(Math.random() * testCards.length)];

        return [ new UpdateComponentCommand(1, shuffles[0][0], new CardShuffle([ ...shuffles[0][0].cards, randomCard ])) ];
    }
}

const shuffleCardCollection = {
    query: {
        cards: new EntityRequest([
            new ComponentSelector(ComponentPurpose.WRITE, CardShuffle)
        ])
    },
    condition: ({ cards }) => {
        return cards.length > 0
    },
    body: (result) => {
        return result.cards.map((entity, index) => {
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

const simulation = new SimpleSimulation()
    .addRule(shuffleCardCollection)
    .addRule(createCardCollection)
    .addRule(addOneCardOnInput);

// const serverAdapter = new LocalServerNetworkAdapter();
// const clientAdapter = new LocalClientNetworkAdapter(serverAdapter);

const serverAdapter = new WebsocketServerNetworkAdapter();
const clientAdapter = new WebsocketClientNetworkAdapter('localhost');

const display: DisplayApi = {
    onInput: () => {},
    takeUpdatedSnapshot(snapshot: WorldStateSnapshot) {
        console.log('------------------------');
        console.log(JSON.stringify(snapshot, null, 2));
    }
};

async function init() {

    await serverAdapter.isReady();
    await clientAdapter.isReady();

    // serverAdapter.sendMessageByRank('client', JSON.stringify({someTestMessage: 1}));
    // clientAdapter.sendMessageByRank('server', JSON.stringify({someTestMessage: 1}));

    new SimpleEngineServer(
        new SimpleECR(simulation),
        new SimpleNetworkServer(serverAdapter),
    ).start();

    new SimpleEngineClient(
        new SimpleSimulation(),
        new SimpleNetworkClient(clientAdapter),
        display
    ).start();

    // Mock Input
    setInterval(() => {
        const num = Math.random();
        if (num > 0.5) {
            display.onInput(new AddOneCardAction());
        }
    }, 2000)
}

init();
