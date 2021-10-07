import _ from "lodash";
import {
    DominoTextRep,
    ExposedTotal,
    ReversedDominoTextRep,
    Total
} from "./DominoViewModel";
import { Board } from "./interfaces/Board";

export const NDominoes = (board: Board): number => {
    if (board.initialRow) {
        return board.initialRow.length;
    } else {
        return (
            1 +
            board.northArm.length +
            board.eastArm.length +
            board.southArm.length +
            board.westArm.length
        );
    }
};

export const BoardIsEmpty = (board: Board): boolean => {
    return NDominoes(board) === 0;
};

export const ScoreBoard = (board: Board): number => {
    if (BoardIsEmpty(board)) {
        throw new Error("Cannot score an empty board");
    }

    let total = 0;
    if (board.spinner) {
        if (board.eastArm.length === 0 && board.westArm.length === 0) {
            total += Total(board.spinner);
        } else if (board.eastArm.length === 0) {
            total += ExposedTotal(_.last(board.westArm)) + Total(board.spinner);
        } else if (board.westArm.length === 0) {
            total += ExposedTotal(_.last(board.eastArm)) + Total(board.spinner);
        } else {
            total += ExposedTotal(_.last(board.westArm));
            total += ExposedTotal(_.last(board.eastArm));
            total += ExposedTotal(_.last(board.northArm));
            total += ExposedTotal(_.last(board.southArm));
        }
    } else {
        total += _.first(board.initialRow).head + _.last(board.initialRow).tail;
    }

    return total % 5 === 0 ? total : 0;
};

export const BoardTextRep = (board: Board): string => {
    // Returns a textual representation of the current board state.

    let rep = "";
    const blank = "     ";

    if (board.spinner) {
        // top
        for (let i = board.northArm.length - 1; i >= 0; i--) {
            for (let i = 0; i < board.westArm.length; i++) {
                rep += blank;
            }

            rep += DominoTextRep(board.northArm[i]) + "\n";
        }

        // middle row
        for (let i = board.westArm.length - 1; i >= 0; i--) {
            rep += ReversedDominoTextRep(board.westArm[i]);
        }

        rep += DominoTextRep(board.spinner);

        for (let i = 0; i < board.eastArm.length; i++) {
            rep += DominoTextRep(board.eastArm[i]);
        }

        rep += "\n";

        // bottom
        for (let i = 0; i < board.southArm.length; i++) {
            for (let i = 0; i < board.westArm.length; i++) {
                rep += blank;
            }

            rep += ReversedDominoTextRep(board.southArm[i]) + "\n";
        }

        return rep;
    } else {
        return board.initialRow.map((domino) => DominoTextRep(domino)).join("");
    }
};
