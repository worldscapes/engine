import {ECRComponent} from "./ecr/state/component/component";
import {
    CheckComponentPurpose,
    ComponentPurposes,
    ComponentSelector,
    EntityRequest,
    ResourcePurposes,
    ResourceRequest,
} from "./ecr/simulation/request/request";
import {SimpleSimulation, WorldStateSnapshot} from "./ecr/simulation/implementations/simple.simulation";
import {WebsocketServerNetworkAdapter} from "./network/adapter/implementations/websocket/websocket-server.adapter";
import {WebsocketClientNetworkAdapter} from "./network/adapter/implementations/websocket/websocket-client.adapter";
import {SimpleEngineClient} from "./engine/client/implementations/simple.client";
import {SimpleEngineServer} from "./engine/server/implementations/simple.server";
import {DisplayApi, UserAction} from "./display/display.api";
import {SimpleNetworkServer} from "./network/server/implementations/simple.server-network";
import {SimpleNetworkClient} from "./network/client/implementations/simple.client-network";
import {SimpleECR} from "./ecr/simple-ecr.api";
import {UserActionResource} from "./ecr/built-in/resource/UserActionResource";
import {ECRRule} from "./ecr/rule/rule";
import {CreateEntityCommand} from "./ecr/command/built-in/create-entity.command";
import {getTypeName} from "./typing/WSCStructure";
import {UpdateComponentCommand} from "./ecr/command/built-in/update-component.command";
import {DeleteResourceCommand} from "./ecr/command/built-in/delete-resource.command";

export * from "./engine/server/worldscapes-server.api";

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

const createCardCollectionRule = ECRRule.create({
    query: {
        entity: {
            entities: new EntityRequest({
                shuffle: new ComponentSelector(CheckComponentPurpose, CardShuffle)
            })
        },
        resource: {}
    },
    condition: ({ entity: { entities } }) => entities.length < 1,
    body: () => {
        return [ new CreateEntityCommand([ new CardShuffle([]) ]) ];
    }
});


const addOneCardOnInputRule = ECRRule.create({
    query: {
        entity: {
            entities: new EntityRequest({
                shuffle: new ComponentSelector(ComponentPurposes.WRITE, CardShuffle)
            })
        },
        resource: {
            addOneActions: new ResourceRequest<UserActionResource<AddOneCardAction>, typeof ComponentPurposes.CHECK>(ComponentPurposes.CHECK, "action_" + getTypeName(AddOneCardAction))
        },
    },
    condition: ({ entity: { entities }, resource: { addOneActions } }) => {
        return !!addOneActions && Object.keys(addOneActions.actions).length > 0 && entities?.length > 0
    },
    body: ({ resource: {}, entity: { entities } }) => {
        const randomCard = testCards[Math.floor(Math.random() * testCards.length)];

        console.log(entities);

        return [ new UpdateComponentCommand(entities[0].entityId, entities[0].shuffle, new CardShuffle([ ...entities[0].shuffle.cards, randomCard ])) ];
    }
});

const shuffleCardCollectionRule = ECRRule.create({
    query: {
        entity: {
            entities: new EntityRequest({
                shuffle: new ComponentSelector(ComponentPurposes.WRITE, CardShuffle)
            })
        },
        resource: {}
    },
    condition: ({ entity: { entities } }) => {
        return entities.length > 0
    },
    body: ({ entity: { entities } }) => {
        return entities.map(({ shuffle }, index) => {
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
});

const clearActionsRule = ECRRule.create({
    query: {
        entity: {},
        resource: {
            addOneActions: new ResourceRequest<UserActionResource<AddOneCardAction>, typeof ResourcePurposes.WRITE>(ResourcePurposes.WRITE, 'action_' + getTypeName(AddOneCardAction))
        }
    },
    condition: ({ resource: { addOneActions } }) => !!addOneActions && Object.keys(addOneActions.actions).length > 0,
    body: () => {
        return [
            new DeleteResourceCommand('action_' + getTypeName(AddOneCardAction))
        ]
    }
})

const simulation = new SimpleSimulation()
    .addRule(shuffleCardCollectionRule)
    .addRule(createCardCollectionRule)
    .addRule(addOneCardOnInputRule)
    .addRule(clearActionsRule)

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

















