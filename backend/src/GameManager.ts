import { GameType } from "@common/enums/GameType";
import { Engine as DominoesEngine } from "@common/games/dominoes/Engine";
import { GameConfigMessage } from "@common/interfaces/GameConfigDescriptionMessage";

export class GameManager {
    public static async RunGame(
        config: GameConfigMessage,
        broadcast: (type: any, payload: any) => void,
        emitToPlayer: (type: any, payload: any, player: number) => void,
        queryPlayer: (type: any, payload: any, player: number) => Promise<any>
    ) {
        const gameType = config.gameType;

        if (gameType === GameType.DOMINOES) {
            const engine = new DominoesEngine(
                config,
                emitToPlayer,
                broadcast,
                queryPlayer
            );
            engine.InitializeRound(true);
            this.players.forEach((player: number) => {
                const gameDetails = {
                    players: this.getPlayerRepresentationsForSeat(player),
                    config: {
                        n_dominoes: config.HandSize
                    }
                };
                const socket = this.getSocketFromId(
                    this.playersToSocketIds.get(player)
                );
                socket.emit(MessageType.GAME_START, gameDetails);
                socket.emit(MessageType.HAND, engine.Players[player].HandRep);
            });
            engine.RunGame();
        }
    }

    // private getNameBySeat = (seat: number) => {
    //     return this.socketIdsToNames.get(this.playersToSocketIds.get(seat));
    // };

    // private getPlayerRepresentationsForSeat(
    //     seatNumber: number
    // ): { seatNumber: number; name: string; isMe: boolean }[] {
    //     return this.players.map((_p, i) => ({
    //         seatNumber: i,
    //         name: this.getNameBySeat(i),
    //         isMe: i === seatNumber
    //     }));
    // }
}
