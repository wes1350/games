import { GameType } from "../enums/GameType";

export interface GameConfigMessage {
    gameType: GameType;
    config: any;
}
