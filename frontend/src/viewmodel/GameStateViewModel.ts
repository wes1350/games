import { GameEvent } from "interfaces/GameEvent";
import { IGameState, IGameStateModel } from "model/GameStateModel";
import { IPlayer } from "model/PlayerModel";

export const GameStateViewModel = (model: IGameStateModel) => {
    const gameState = model as IGameState;

    return {
        get Me(): IPlayer {
            return gameState.Players.find((player) => player.IsMe);
        },

        get Opponents(): IPlayer[] {
            return gameState.Players.filter((player) => !player.IsMe);
        },

        get CurrentPlayer(): IPlayer {
            return gameState.Players[gameState.CurrentPlayerIndex];
        },

        get CurrentEvent(): GameEvent {
            return gameState.Events.length > 0 ? gameState.Events[0] : null;
        },

        PlayerAtSeat(seat: number): IPlayer {
            return gameState.Players.find(
                (player) => player.SeatNumber === seat
            );
        },

        PlayableDominoesForPlayer(seat: number): number[] {
            if (seat !== gameState.CurrentPlayerIndex) {
                return null;
            }
        },

        get SeatToPositionMapping(): Map<number, number> {
            const n_players = gameState.Config.N_PLAYERS;
            // maps opponent seat number to the display index
            const playerIndices = new Map<number, number>();
            const mySeat = gameState.Players.find(
                (player) => player.IsMe
            ).SeatNumber;
            playerIndices.set(mySeat, 0);
            if (n_players === 2) {
                playerIndices.set((mySeat + 1) % n_players, 1);
            } else if (n_players === 3) {
                playerIndices.set((mySeat + 1) % n_players, 2);
                playerIndices.set((mySeat + 2) % n_players, 1);
            } else if (n_players === 4) {
                playerIndices.set((mySeat + 1) % n_players, 2);
                playerIndices.set((mySeat + 2) % n_players, 1);
                playerIndices.set((mySeat + 3) % n_players, 3);
            }

            return playerIndices;
        }
    };
};
