import { GameType } from "@games-common/enums/GameType";
import { Config } from "@games-common/games/dominoes/Config";
import { Engine } from "@games-common/games/dominoes/Engine";
import { GameConfig } from "@games-common/interfaces/GameConfig";
import { PlayerDetails } from "@games-common/interfaces/PlayerDetails";
import _ from "lodash";

export class GameManager {
    public static async RunGame(
        config: GameConfig,
        playerDetails: PlayerDetails[],
        broadcast: (type: any, payload: any) => void,
        emitToPlayer: (type: any, payload: any, playerId: string) => void,
        queryPlayer: (type: any, payload: any, playerId: string) => Promise<any>
    ) {
        const gameType = config.gameType;

        if (gameType === GameType.DOMINOES) {
            const engine = new Engine(
                { ...config, nPlayers: playerDetails.length },
                playerDetails,
                emitToPlayer,
                broadcast,
                queryPlayer
            );
            engine.RunGame();
        }
    }
}
