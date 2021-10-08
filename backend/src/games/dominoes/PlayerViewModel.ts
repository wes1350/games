import { Total } from "./DominoViewModel";
import { Player } from "./interfaces/Player";

export const HandTotal = (player: Player): number => {
    return player.hand
        .map((domino) => Total(domino))
        .reduce((a, b) => a + b, 0);
};

export const HandIsEmpty = (player: Player): boolean => {
    return player.hand.length === 0;
};

export const HandTextRep = (player: Player): number[][] => {
    return player.hand.map((domino) => [domino.head, domino.tail]);
};
