import _ from "lodash";
import { DominoViewModel } from "./DominoViewModel";
import { Board } from "./interfaces/Board";

export class BoardViewModel {
    public static NDominoes(board: Board): number {
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
    }

    public static IsEmpty(board: Board): boolean {
        return BoardViewModel.NDominoes(board) === 0;
    }

    public static Score(board: Board): number {
        if (BoardViewModel.IsEmpty(board)) {
            throw new Error("Cannot score an empty board");
        }

        let total = 0;
        if (board.spinner) {
            if (board.eastArm.length === 0 && board.westArm.length === 0) {
                total += DominoViewModel.Total(board.spinner);
            } else if (board.eastArm.length === 0) {
                total +=
                    DominoViewModel.ExposedTotal(_.last(board.westArm)) +
                    DominoViewModel.Total(board.spinner);
            } else if (board.westArm.length === 0) {
                total +=
                    DominoViewModel.ExposedTotal(_.last(board.eastArm)) +
                    DominoViewModel.Total(board.spinner);
            } else {
                total += DominoViewModel.ExposedTotal(_.last(board.westArm));
                total += DominoViewModel.ExposedTotal(_.last(board.eastArm));
                total += DominoViewModel.ExposedTotal(_.last(board.northArm));
                total += DominoViewModel.ExposedTotal(_.last(board.southArm));
            }
        } else {
            total +=
                _.first(board.initialRow).head + _.last(board.initialRow).tail;
        }

        return total % 5 === 0 ? total : 0;
    }

    public static TextRep(board: Board): string {
        // Returns a textual representation of the current board state.

        let rep = "";
        const blank = "     ";

        if (board.spinner) {
            // top
            for (let i = board.northArm.length - 1; i >= 0; i--) {
                for (let i = 0; i < board.westArm.length; i++) {
                    rep += blank;
                }

                rep += DominoViewModel.TextRep(board.northArm[i]) + "\n";
            }

            // middle row
            for (let i = board.westArm.length - 1; i >= 0; i--) {
                rep += DominoViewModel.ReversedTextRep(board.westArm[i]);
            }

            rep += DominoViewModel.TextRep(board.spinner);

            for (let i = 0; i < board.eastArm.length; i++) {
                rep += DominoViewModel.TextRep(board.eastArm[i]);
            }

            rep += "\n";

            // bottom
            for (let i = 0; i < board.southArm.length; i++) {
                for (let i = 0; i < board.westArm.length; i++) {
                    rep += blank;
                }

                rep +=
                    DominoViewModel.ReversedTextRep(board.southArm[i]) + "\n";
            }

            return rep;
        } else {
            return board.initialRow
                .map((domino) => DominoViewModel.TextRep(domino))
                .join("");
        }
    }
}
