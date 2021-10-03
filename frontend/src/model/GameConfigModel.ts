import { Instance, types } from "mobx-state-tree";

export const GameConfigModel = types.model({
    N_PLAYERS: types.number,
    HAND_SIZE: types.number
});

export type IGameConfigModel = Instance<typeof GameConfigModel>;

export const GameConfig = GameConfigModel.named("GameConfig");
export type IGameConfig = Instance<typeof GameConfig>;
