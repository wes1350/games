import { Player } from "./interfaces/Player";

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
