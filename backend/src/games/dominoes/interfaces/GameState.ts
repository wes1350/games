import { Board } from "../Board";
import { Domino } from "../Domino";
import { Pack } from "../Pack";

export interface GameState {
    config: any; //GameConfigDescription; // Need to figure out imports with common, etc.
    currentPlayerIndex: number;
    players: {
        index: number;
        score: number;
        hand: Domino[];
    }[];
    pack: Pack;
    board: Board;
    nPasses: number;
}

export interface MaskedGameState {
    config: any; //GameConfigDescription; // Need to figure out imports with common, etc.
    myIndex: number;
    currentPlayerIndex: number;
    players: {
        index: number;
        score: number;
        hand: Domino[] | null;
        handSize: number;
    }[];
    packSize: number;
    board: Board;
    nPasses: number;
}
