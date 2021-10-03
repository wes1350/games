import { Direction } from "enums/Direction";
import { Coordinate } from "interfaces/Coordinate";
import { BoardDomino } from "model/BoardDominoModel";
import { IBoard, IBoardModel } from "model/BoardModel";
import { IDomino } from "model/DominoModel";
import { cast } from "mobx-state-tree";

export const BoardController = (model: IBoardModel) => {
    const board = model as IBoard;

    return {
        AddDomino(
            domino: IDomino,
            direction: Direction,
            location: Coordinate
        ): void {
            const boardDomino = BoardDomino.create({
                Domino: domino,
                Direction: direction,
                Location: location,
                BoundingBox: board.CalculateBoundingBox(domino, location)
            });

            board.Dominoes.push(boardDomino);

            if (domino.IsDouble && !board.Spinner) {
                board.SpinnerIndex = board.Dominoes.length - 1;
            }
        },

        ClearBoard() {
            board.Dominoes = cast([]);
            board.SpinnerIndex = null;
        }
    };
};
