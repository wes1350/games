import { DominoTextRep, Equals, Domino, Total } from "./Domino";

export class Player {
    id: string;
    index: number;
    name: string;
    hand: Domino[];
    score: number;
}

export const InitializePlayer = (
    id: string,
    index: number,
    name: string
): Player => {
    return {
        id,
        index,
        name,
        hand: [],
        score: 0
    };
};

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

export const AddDominoToHand = (player: Player, domino: Domino) => {
    return { ...player, hand: [...player.hand, domino] };
};

export const RemoveDominoFromHand = (player: Player, domino: Domino) => {
    const requestedDomino = player.hand.find((d) => Equals(domino, d));
    if (!requestedDomino) {
        throw new Error(
            `Could not find domino ${DominoTextRep(domino)} in hand.`
        );
    } else {
        return {
            ...player,
            hand: player.hand.filter((d) => !Equals(domino, d))
        };
    }
};

export const AddPoints = (player: Player, points: number) => {
    return { ...player, score: player.score + points };
};
