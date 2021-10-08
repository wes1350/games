import { DominoTextRep, Equals } from "./DominoViewModel";
import { Domino } from "./interfaces/Domino";
import { Player } from "./interfaces/Player";

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
