import {
  CheckComponentPurpose,
  ComponentPurposes,
  ComponentSelector,
  CreateEntityCommand,
  DeleteResourceCommand,
  ECRRule,
  EntityRequest,
  getTypeName,
  ResourcePurposes,
  ResourceRequest,
  SimpleEcr,
  UpdateComponentCommand,
} from "@worldscapes/common";
import {SimpleEngineServer, SimpleNetworkServer, SimpleServerSimulation, UserActionResource, WebsocketServerNetworkAdapter} from "@worldscapes/server";
import {AddOneCardAction, CardShuffle, TEST_CARDS} from "@worldscapes/testing-common";

const query = {
  entity: {
    shuffles: new EntityRequest({
      shuffle: new ComponentSelector(ComponentPurposes.WRITE, CardShuffle),
    }),
  },
  resource: {
    addOneActions: new ResourceRequest<
      UserActionResource<AddOneCardAction>,
      typeof ResourcePurposes.CHECK
    >(ResourcePurposes.CHECK, "test"),
  },
};

const createCardCollectionRule = ECRRule.create({
  query: {
    entity: {
      shuffles: new EntityRequest({
        shuffle: new ComponentSelector(CheckComponentPurpose, CardShuffle),
      }),
    },
    resource: {},
  },
  condition: ({ entity: { shuffles } }) => shuffles.length < 1,
  body: () => {
    return [new CreateEntityCommand([new CardShuffle([])])];
  },
});

const addOneCardOnInputRule = ECRRule.create({
  query: {
    entity: {
      shuffles: new EntityRequest({
        shuffle: new ComponentSelector(ComponentPurposes.WRITE, CardShuffle),
      }),
    },
    resource: {
      addOneActions: new ResourceRequest<
        UserActionResource<AddOneCardAction>,
        typeof ResourcePurposes.CHECK
      >(ResourcePurposes.CHECK, "action_" + getTypeName(AddOneCardAction)),
    },
  },
  condition: ({ entity: { shuffles }, resource: { addOneActions } }) => {
    return (
      !!addOneActions &&
      Object.keys(addOneActions.actions).length > 0 &&
      shuffles?.length > 0
    );
  },
  body: ({ entity: { shuffles } }) => {
    const randomCard = TEST_CARDS[Math.floor(Math.random() * TEST_CARDS.length)];

    return [
      new UpdateComponentCommand(
        shuffles[0].entityId,
        shuffles[0].shuffle,
        new CardShuffle([...shuffles[0].shuffle.cards, randomCard])
      ),
    ];
  },
});

const shuffleCardCollectionRule = ECRRule.create({
  query: {
    entity: {
      shuffles: new EntityRequest({
        shuffle: new ComponentSelector(ComponentPurposes.WRITE, CardShuffle),
      }),
    },
    resource: {},
  },
  condition: ({ entity: { shuffles } }) => {
    return shuffles.length > 0;
  },
  body: ({ entity: { shuffles } }) => {
    return shuffles.map(({ shuffle }, index) => {
      return new UpdateComponentCommand(
        index + 1,
        shuffle,
        new CardShuffle(
          [...shuffle.cards].sort((card1, card2) => card1.value - card2.value)
        )
      );
    });
  },
});

const clearActionsRule = ECRRule.create({
  query: {
    entity: {},
    resource: {
      addOneActions: new ResourceRequest<
        UserActionResource<AddOneCardAction>,
        typeof ResourcePurposes.WRITE
      >(ResourcePurposes.WRITE, "action_" + getTypeName(AddOneCardAction)),
    },
  },
  condition: ({ resource: { addOneActions } }) =>
    !!addOneActions && Object.keys(addOneActions.actions).length > 0,
  body: () => {
    return [
      new DeleteResourceCommand("action_" + getTypeName(AddOneCardAction)),
    ];
  },
});

console.log("Creating simulation instance.");
const ecr = new SimpleEcr()
  .addRule(shuffleCardCollectionRule)
  .addRule(createCardCollectionRule)
  .addRule(addOneCardOnInputRule)
  .addRule(clearActionsRule);

// const serverAdapter = new LocalServerNetworkAdapter();

console.log("Creating adapters.");
const serverAdapter = new WebsocketServerNetworkAdapter();

async function init() {
  console.log("Waiting for network adapter connection.");
  await serverAdapter.isReady();

  serverAdapter.sendMessageToAll("{ 'test' : 123 }");

  // serverAdapter.sendMessageByRank('client', JSON.stringify({someTestMessage: 1}));
  // clientAdapter.sendMessageByRank('server', JSON.stringify({someTestMessage: 1}));

  console.log("Starting Server.");
  new SimpleEngineServer(
    new SimpleServerSimulation(ecr),
    new SimpleNetworkServer(serverAdapter),
  ).start();

  console.log("Successfully initialized.");
}

init();