import _ from "lodash";
import { Direction } from "./enums/Direction";
import {
    DominoTextRep,
    IsDouble,
    Domino,
    ExposedTotal,
    ReversedDominoTextRep,
    HasFace,
    Total,
    Reversed
} from "./Domino";

export interface Board {
    spinner: Domino | null;
    northArm: Domino[]; // The arms will be empty before there is a spinner and filled in after
    eastArm: Domino[];
    southArm: Domino[];
    westArm: Domino[];
    initialRow: Domino[] | null; // This will be filled in before there is a spinner and null after
}

export const InitializeBoard = (): Board => {
    return {
        spinner: null,
        northArm: [],
        eastArm: [],
        southArm: [],
        westArm: [],
        initialRow: []
    };
};

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
                newBoard.initialRow.map((domino) => Reversed(domino))
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
                    newBoard.initialRow.push(Reversed(domino));
                } else {
                    newBoard.initialRow.push(domino);
                }
            } else if (direction === Direction.WEST) {
                const end = _.first(newBoard.initialRow);
                if (end.head !== domino.tail) {
                    newBoard.initialRow.unshift(Reversed(domino));
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
                arm.push(Reversed(domino));
            } else {
                arm.push(domino);
            }
        }
    }
    return newBoard;
};

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

export const GetArmByDirection = (board: Board, direction: Direction) => {
    if (direction === Direction.NONE) {
        return null;
    } else if (direction === Direction.NORTH) {
        return board.northArm;
    } else if (direction === Direction.EAST) {
        return board.eastArm;
    } else if (direction === Direction.SOUTH) {
        return board.southArm;
    } else if (direction === Direction.WEST) {
        return board.westArm;
    }
};

export const VerifyPlacement = (
    board: Board,
    domino: Domino,
    direction: Direction
): boolean => {
    // Return whether a domino can be placed in the given direction
    if (direction === Direction.NONE) {
        return NDominoes(board) === 0;
    } else {
        if (NDominoes(board) === 0) {
            return false;
        }

        if (board.spinner) {
            if (
                direction === Direction.NORTH ||
                direction === Direction.SOUTH
            ) {
                if (board.eastArm.length === 0 || board.westArm.length === 0) {
                    return false;
                }
            }
            const arm = GetArmByDirection(board, direction);
            const end = _.last(arm) ?? board.spinner;
            return HasFace(domino, end.tail);
        } else {
            if (direction === Direction.EAST) {
                return HasFace(domino, _.last(board.initialRow).tail);
            } else if (direction === Direction.WEST) {
                return HasFace(domino, _.first(board.initialRow).head);
            } else {
                return false;
            }
        }
    }
};

export const GetValidPlacements = (
    board: Board,
    domino: Domino
): Direction[] => {
    // Return which directions a domino can be placed in.
    if (BoardIsEmpty(board)) {
        return [Direction.NONE];
    }
    return Object.values(Direction).filter((d) =>
        VerifyPlacement(board, domino, d)
    );
};

export const GetValidPlacementsForHand = (
    board: Board,
    hand: Domino[],
    playFresh = false
): { index: number; domino: Domino; dirs: Direction[] }[] => {
    const placements: {
        index: number;
        domino: Domino;
        dirs: Direction[];
    }[] = [];
    let largestDouble = -1;
    if (playFresh) {
        hand.forEach((domino: Domino) => {
            if (
                IsDouble(domino) &&
                Math.max(domino.head, domino.tail) > largestDouble
            ) {
                largestDouble = Math.max(domino.head, domino.tail);
            }
        });
    }
    hand.forEach((domino, i) => {
        if (playFresh) {
            if (
                Math.max(domino.head, domino.tail) !== largestDouble ||
                !IsDouble(domino)
            ) {
                placements.push({ index: i, domino, dirs: [] });
            } else {
                placements.push({
                    index: i,
                    domino,
                    dirs: GetValidPlacements(board, domino)
                });
            }
        } else {
            placements.push({
                index: i,
                domino,
                dirs: GetValidPlacements(board, domino)
            });
        }
    });
    return placements;
};
