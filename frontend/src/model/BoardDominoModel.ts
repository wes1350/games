import { BoardDominoController } from "controller/BoardDominoController";
import { Direction } from "enums/Direction";
import { BoundingBox } from "interfaces/BoundingBox";
import { Coordinate } from "interfaces/Coordinate";
import { BoardDominoViewModel } from "viewmodel/BoardDominoViewModel";
import { Instance, types } from "mobx-state-tree";
import { Domino } from "./DominoModel";

export const BoardDominoModel = types.model({
    Domino: types.late(() => Domino),
    Location: types.frozen<Coordinate>(),
    Direction: types.enumeration<Direction>(
        "Direction",
        Object.values(Direction)
    ),
    BoundingBox: types.frozen<BoundingBox>()
});

export type IBoardDominoModel = Instance<typeof BoardDominoModel>;

export const BoardDomino = BoardDominoModel.actions(
    BoardDominoController
).views(BoardDominoViewModel);
export type IBoardDomino = Instance<typeof BoardDomino>;
