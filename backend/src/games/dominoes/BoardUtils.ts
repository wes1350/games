import _ from "lodash";
import { BoardIsEmpty, NDominoes } from "./BoardViewModel";
import { HasFace, IsDouble } from "./DominoViewModel";
import { Direction } from "./enums/Direction";
import { Board } from "./interfaces/Board";
import { Domino } from "./interfaces/Domino";

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
