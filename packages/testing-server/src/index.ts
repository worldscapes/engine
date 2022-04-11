import {
  ComponentPurposes,
  ComponentSelector,
  CreateEntityCommand,
  ECRRule,
  EntityRequest,
  SimpleEcr,
  UpdateComponentCommand,
  PlayerInfo,
  UserActionTools, OwnedComponent,
} from "@worldscapes/common";
import {SimpleEngineServer, SimpleNetworkServer, SimpleServerAuth, SimpleServerSimulation, WebsocketServerNetworkAdapter} from "@worldscapes/server";
import {AddOneCardAction, CardShuffle, TEST_CARDS} from "@worldscapes/testing-common";

const players: PlayerInfo[] = [
  { id: "1", name: "TestPlayer1" },
  { id: "2", name: "TestPlayer2" }
];

const initCommands = [
    new CreateEntityCommand([ new OwnedComponent(players[0].id), new CardShuffle([])]),
    new CreateEntityCommand([ new OwnedComponent(players[1].id), new CardShuffle([])]),
];

function isSet<T>(value: T): value is Exclude<T, null | undefined> {
  return !!value;
}

const addOneCardOnInputRule = ECRRule.create({
  query: {
    entity: {
      actions: UserActionTools.CreateRequest(AddOneCardAction),
      shuffles: new EntityRequest({
        owner: new ComponentSelector(ComponentPurposes.READ, OwnedComponent),
        shuffle: new ComponentSelector(ComponentPurposes.WRITE, CardShuffle),
      }),
    },
    resource: {}
  },
  condition: ({ entity: { actions, shuffles } }) => {
    return (
      actions.length > 0 && shuffles?.length > 0
    );
  },
  body: ({ entity: { actions, shuffles } }) => {
    return actions
      .map(action => {
        const randomCard = TEST_CARDS[Math.floor(Math.random() * TEST_CARDS.length)];
        const shuffle = shuffles.find(shuffle => shuffle.owner.ownerId === action.owner.ownerId);

        if (!shuffle) {
          return null;
        }

        return new UpdateComponentCommand(
          shuffle.entityId,
          shuffle.shuffle,
          new CardShuffle([...shuffle.shuffle.cards, randomCard])
        );
      })
      .filter(isSet);
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
    return shuffles.map(({ entityId, shuffle }, index) => {
      return new UpdateComponentCommand(
        entityId,
        shuffle,
        new CardShuffle(
          [...shuffle.cards].sort((card1, card2) => card1.value - card2.value)
        )
      );
    });
  },
});


console.log("Creating simulation instance.");
const ecr = new SimpleEcr()
  .addRule(shuffleCardCollectionRule)
  .addRule(addOneCardOnInputRule);

ecr.injectCommands(initCommands);

// const serverAdapter = new LocalServerNetworkAdapter();

async function init() {

  console.log("Creating adapters.");
  const serverAdapter = new WebsocketServerNetworkAdapter(
      new SimpleServerAuth(players)
  );

  console.log("Waiting for network adapter to prepare.");
  await serverAdapter.isReady();
  console.log("Network adapter is ready.");

  serverAdapter.sendMessageToAll("{ 'test' : 123 }");

  // serverAdapter.sendMessageByRank('client', JSON.stringify({someTestMessage: 1}));
  // clientAdapter.sendMessageByRank('server', JSON.stringify({someTestMessage: 1}));

  console.log("Starting Server Engine.");
  new SimpleEngineServer(
    new SimpleServerSimulation(ecr, players),
    new SimpleNetworkServer(serverAdapter),
  ).start();

  console.log("Successfully initialized.");
}

init();