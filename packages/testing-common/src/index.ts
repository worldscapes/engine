import {ECRComponent, PlayerAction} from "@worldscapes/common";

export class CardShuffle extends ECRComponent {
    constructor(readonly cards: typeof TEST_CARDS[number][] = []) {
        super();
    }
}

export class AddOneCardAction extends PlayerAction {}

export const TEST_CARDS = [
    {
        name: "six",
        value: 1,
    },
    {
        name: "seven",
        value: 2,
    },
    {
        name: "eight",
        value: 3,
    },
    {
        name: "nine",
        value: 4,
    },
    {
        name: "ten",
        value: 5,
    },
];