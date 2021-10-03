import { GameType } from "../enums/GameType";

export interface GameConfigDescriptionMessage {
    gameType: GameType;
    config: any;
}
