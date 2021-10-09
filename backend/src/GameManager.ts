import { GameType } from "games-common/src/enums/GameType";
import { Engine } from "games-common/src/games/dominoes/Engine";
import { GameConfigMessage as DominoesGameConfigMessage } from "games-common/src/games/dominoes/interfaces/GameConfigMessage";
import { PlayerDetails } from "games-common/src/interfaces/PlayerDetails";
import _ from "lodash";
// import { GameType } from "./common/enums/GameType";
// import { Engine as DominoesEngine } from "./games/dominoes/Engine";
// import { GameConfigMessage as DominoesGameConfigMessage } from "./games/dominoes/interfaces/GameConfigMessage";
// import { PlayerDetails } from "./interfaces/PlayerDetails";

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
            const engine = new Engine(
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
