import _ from "lodash";
import { GetArmByDirection, VerifyPlacement } from "./BoardUtils";
import { BoardIsEmpty } from "./BoardViewModel";
import { DominoController } from "./DominoController";
import { DominoTextRep, IsDouble } from "./DominoViewModel";
import { Direction } from "./enums/Direction";
import { Board } from "./interfaces/Board";
import { Domino } from "./interfaces/Domino";

export const AddDominoToBoard = (
    board: Board,
    domino: Domino,
    direction: Direction
): Board => {
    const newBoard = _.cloneDeep(board);
    if (!VerifyPlacement(board, domino, direction)) {
        throw new Error(
            `Domino ${DominoTextRep(
                domino
            )} cannot be added in the ${direction} direction`
        );
    }

    if (direction === Direction.NONE && !BoardIsEmpty(newBoard)) {
        throw new Error(
            "Tried to add a domino without a direction when it was not the first domino"
        );
    }

    if (IsDouble(domino) && !newBoard.spinner) {
        newBoard.spinner = domino;
        // Assign the already-played dominoes to arms, and clear the initial row
        if (direction === Direction.EAST) {
            // In the initial row, the Head of each domino is on the left. As the spinner is on
            // the east now, the Heads should point towards the spinner, so we need to reverse them.
            // Also reverse their order, so that the last one is furthest from the center.
            newBoard.westArm = _.reverse(
                newBoard.initialRow.map((domino) =>
                    DominoController.Reverse(domino)
                )
            );
        } else if (direction === Direction.WEST) {
            newBoard.eastArm = newBoard.initialRow;
        }
        newBoard.initialRow = null;
    } else {
        if (!newBoard.spinner) {
            if (direction === Direction.NONE) {
                newBoard.initialRow.push(domino);
            } else if (direction === Direction.EAST) {
                const end = _.last(newBoard.initialRow);
                if (end.tail !== domino.head) {
                    newBoard.initialRow.push(DominoController.Reverse(domino));
                } else {
                    newBoard.initialRow.push(domino);
                }
            } else if (direction === Direction.WEST) {
                const end = _.first(newBoard.initialRow);
                if (end.head !== domino.tail) {
                    newBoard.initialRow.unshift(
                        DominoController.Reverse(domino)
                    );
                } else {
                    newBoard.initialRow.unshift(domino);
                }
            } else {
                throw new Error(
                    `Invalid direction encountered when no spinner was set: ${direction}`
                );
            }
        } else {
            const arm = GetArmByDirection(newBoard, direction);
            const end = _.last(arm) ?? newBoard.spinner;
            if (end.tail !== domino.head) {
                arm.push(DominoController.Reverse(domino));
            } else {
                arm.push(domino);
            }
        }
    }
    return newBoard;
};
