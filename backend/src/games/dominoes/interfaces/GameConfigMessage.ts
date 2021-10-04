import { GameType } from "../../../common/enums/GameType";

export interface GameConfigMessage {
    gameType: GameType;
    nPlayers?: number;
    handSize?: number;
    check5Doubles?: boolean;
    winThreshold?: number;
}
