import { GameStateController } from "controller/GameStateController";
import { QueryType } from "enums/QueryType";
import { GameStateViewModel } from "viewmodel/GameStateViewModel";
import { Instance, types } from "mobx-state-tree";
import { Board } from "./BoardModel";
import { GameConfig } from "./GameConfigModel";
import { Player } from "./PlayerModel";
import { GameEvent } from "interfaces/GameEvent";

export const GameStateModel = types.model({
    Config: types.late(() => GameConfig),
    Started: false,
    GameOver: false,
    Winner: types.maybeNull(types.string),
    CurrentPlayerIndex: types.maybeNull(types.integer),
    Players: types.array(types.late(() => Player)),
    Logs: types.array(types.string),
    Board: types.late(() => Board),
    CurrentQueryType: types.maybeNull(
        types.enumeration<QueryType>("QueryType", Object.values(QueryType))
    ),
    Events: types.array(types.frozen<GameEvent>())
});

export type IGameStateModel = Instance<typeof GameStateModel>;

export const GameState = GameStateModel.actions(GameStateController)
    .views(GameStateViewModel)
    .named("GameState");
export type IGameState = Instance<typeof GameState>;
