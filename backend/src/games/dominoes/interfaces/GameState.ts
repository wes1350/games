import { Board } from "./Board";

export interface GameState {
    config: any; //GameConfigDescription; // Need to figure out imports with common, etc.
    seatNumberForTurn: number;
    players: {
        me: {
            seatNumber: number;
            score: number;
            hand: { head: number; tail: number }[];
        };
        opponents: {
            seatNumber: number;
            score: number;
            dominoesInHand: number;
        }[];
    };
    board: Board;
}
