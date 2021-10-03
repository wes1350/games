import { Direction } from "enums/Direction";
import { QueryType } from "enums/QueryType";
import { Coordinate } from "interfaces/Coordinate";
import { Domino, IDomino } from "model/DominoModel";
import { IGameState, IGameStateModel } from "model/GameStateModel";
import { IPlayer } from "model/PlayerModel";
import _ from "lodash";
import { cast } from "mobx-state-tree";
import { GameEvent } from "interfaces/GameEvent";

export const GameStateController = (model: IGameStateModel) => {
    const gameState = model as IGameState;

    return {
        AddPlayer(player: IPlayer) {
            gameState.Players.push(player);
        },

        Start() {
            gameState.Started = true;
        },

        Finish(winner: string) {
            gameState.GameOver = true;
            gameState.Winner = winner;
        },

        ProcessTurn(
            domino: IDomino,
            direction: Direction,
            coordinate: Coordinate
        ) {
            if (domino) {
                gameState.Board.AddDomino(domino, direction, coordinate);
            }

            gameState.CurrentPlayerIndex =
                (gameState.CurrentPlayerIndex + 1) % gameState.Config.N_PLAYERS;
        },

        ProcessScore(seat: number, score: number) {
            const currentPlayer = gameState.Players.find(
                (player) => player.SeatNumber === seat
            );
            currentPlayer.SetScore(score + currentPlayer.Score);
        },

        SetQueryType(type: QueryType) {
            if (type === QueryType.MOVE) {
                gameState.CurrentQueryType = QueryType.MOVE;
            } else {
                throw new Error(`Invalid query type: ${type}`);
            }
        },

        SetCurrentPlayerIndex(seat: number) {
            gameState.CurrentPlayerIndex = seat;
        },

        InitializeOpponentHands() {
            gameState.Opponents.forEach((player) => {
                player.SetHand(
                    _.range(0, gameState.Config.HAND_SIZE).map(() =>
                        Domino.create({
                            Face1: -1,
                            Face2: -1
                        })
                    )
                );
            });
        },

        ClearBoard(): void {
            gameState.Board.ClearBoard();
        },

        AddLog(log: string): void {
            gameState.Logs.push(log);
        },

        AddEvent(event: GameEvent): void {
            gameState.Events = cast([...gameState.Events, event]);
        },

        ClearEvent(): void {
            if (gameState.Events.length > 0) {
                gameState.Events = cast(gameState.Events.slice(1));
            }
        }
    };
};
