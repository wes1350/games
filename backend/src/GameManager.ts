import _ from "lodash";
import { GameType } from "./common/enums/GameType";
import { Engine as DominoesEngine } from "./games/dominoes/Engine";
import { GameConfigMessage as DominoesGameConfigMessage } from "./games/dominoes/interfaces/GameConfigMessage";
import { PlayerDetails } from "./interfaces/PlayerDetails";

export class GameManager {
    public static async RunGame(
        gameConfig: any,
        playerDetails: PlayerDetails[],
        broadcast: (type: any, payload: any) => void,
        emitToPlayer: (type: any, payload: any, playerId: string) => void,
        queryPlayer: (type: any, payload: any, playerId: string) => Promise<any>
    ) {
        const gameType = gameConfig.gameType;

        if (gameType === GameType.DOMINOES) {
            const config = gameConfig as DominoesGameConfigMessage;
            const engine = new DominoesEngine(
                config,
                playerDetails,
                emitToPlayer,
                broadcast,
                queryPlayer
            );
            engine.RunGame();
        }
    }
}
