import { BoardController } from "controller/BoardController";
import { BoardViewModel } from "viewmodel/BoardViewModel";
import { Instance, types } from "mobx-state-tree";
import { BoardDomino } from "./BoardDominoModel";

export const BoardModel = types.model({
    Dominoes: types.array(types.late(() => BoardDomino)),
    SpinnerIndex: types.maybeNull(types.number)
});

export type IBoardModel = Instance<typeof BoardModel>;

export const Board = BoardModel.actions(BoardController)
    .views(BoardViewModel)
    .named("Board");
export type IBoard = Instance<typeof Board>;
