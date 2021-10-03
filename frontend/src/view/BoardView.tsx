import { Direction } from "enums/Direction";
import React from "react";
import "./BoardView.css";
import { BoardDominoView } from "./BoardDominoView";
import { IBoard } from "model/BoardModel";
import { observer } from "mobx-react-lite";
import { BoundingBox } from "interfaces/BoundingBox";
import { IBoardDomino } from "model/BoardDominoModel";
import { rotateDirectionClockwise } from "utils/utils";
import _ from "lodash";
import { useDrop } from "react-dnd";
import { DragItemTypes } from "enums/DragItemTypes";

interface IProps {
    board: IBoard;
    width: number;
    height: number;
    onDropDomino: (item: { index: number }, direction: Direction) => void;
    dominoBeingDragged: IBoardDomino;
}

export const BoardView = observer((props: IProps) => {
    const [, drop] = useDrop(() => ({
        accept: DragItemTypes.DOMINO,
        drop: (item: { index: number }, monitor) => {
            if (props.board.Dominoes.length === 0) {
                props.onDropDomino(item, Direction.NONE);
            }
        },
        collect: (monitor) => ({
            // isOver: !!monitor.isOver(),
            // canDrop: props.board.Dominoes.length === 0
            // isDragging: (monitor as any).internalMonitor.isDragging()
        })
    }));

    if (!props.width || !props.height) {
        return null;
    }

    // Have some condition to not render the board or something if the screen is too small
    // Can we just arbitrarily scale everything though?

    const translateBoundingBox = (box: BoundingBox, x: number, y: number) => {
        return {
            North: box.North + y,
            East: box.East + x,
            South: box.South + y,
            West: box.West + x
        };
    };

    const boundingBoxesAreClose = (
        box1: BoundingBox,
        box2: BoundingBox,
        distance: number
    ): boolean => {
        if (box1.North >= box2.South && box1.North - distance <= box2.South) {
            return true;
        }
        if (box1.South <= box2.North && box1.South + distance >= box2.North) {
            return true;
        }
        if (box1.West >= box2.East && box1.West - distance <= box2.East) {
            return true;
        }
        if (box1.East <= box2.West && box1.East + distance >= box2.West) {
            return true;
        }
        return false;
    };

    const boundingBoxFitsInGrid = (
        boundingBox: BoundingBox,
        gridWidth: number,
        gridHeight: number
    ): boolean => {
        return (
            boundingBox.North >= 0 &&
            boundingBox.West >= 0 &&
            boundingBox.East <= gridWidth &&
            boundingBox.South <= gridHeight
        );
    };

    const bendBoundingBoxAroundPoint = (
        box: BoundingBox,
        x: number,
        y: number,
        direction: Direction,
        aroundDouble: boolean
    ): BoundingBox => {
        // When bending a non-double around a double, cannot just reflect around the same point, needs some shifting
        const parallelAxisAdjustmentForDoubles = aroundDouble ? -1 : 0;
        const perpendicularAxisAdjustmentForDoubles = aroundDouble ? 2 : 0;

        if (direction === Direction.NORTH) {
            return {
                North: y - (box.East - x) - parallelAxisAdjustmentForDoubles,
                East:
                    x - (box.North - y) + perpendicularAxisAdjustmentForDoubles,
                South: y - (box.West - x) - parallelAxisAdjustmentForDoubles,
                West:
                    x - (box.South - y) + perpendicularAxisAdjustmentForDoubles
            };
        } else if (direction === Direction.SOUTH) {
            return {
                North: y - (box.East - x) + parallelAxisAdjustmentForDoubles,
                East:
                    x - (box.North - y) - perpendicularAxisAdjustmentForDoubles,
                South: y - (box.West - x) + parallelAxisAdjustmentForDoubles,
                West:
                    x - (box.South - y) - perpendicularAxisAdjustmentForDoubles
            };
            // Need to ensure we do this only if the spinner has been encountered here
        } else if (direction === Direction.EAST) {
            return {
                North:
                    y + (box.West - x) + perpendicularAxisAdjustmentForDoubles,
                East: x + (box.South - y) + parallelAxisAdjustmentForDoubles,
                South:
                    y + (box.East - x) + perpendicularAxisAdjustmentForDoubles,
                West: x + (box.North - y) + parallelAxisAdjustmentForDoubles
            };
        } else if (direction === Direction.WEST) {
            return {
                North:
                    y + (box.West - x) - perpendicularAxisAdjustmentForDoubles,
                East: x + (box.South - y) - parallelAxisAdjustmentForDoubles,
                South:
                    y + (box.East - x) - perpendicularAxisAdjustmentForDoubles,
                West: x + (box.North - y) - parallelAxisAdjustmentForDoubles
            };
        }
    };

    const layoutDominoes = (
        gridWidthInPixels: number,
        gridHeightInPixels: number,
        board: IBoard
    ): {
        gridWidthInSquares: number;
        gridHeightInSquares: number;
        gridSquarePixelSize: number;
        boundingBoxes: BoundingBox[];
        dominoOrientationDirections: Direction[];
    } => {
        const boundingBoxes = board.Dominoes.map(
            (domino) => domino.BoundingBox
        );
        const baseDominoLayoutHorizontalSpan =
            board.RenderedEastBoundary - board.RenderedWestBoundary;
        const baseDominoLayoutVerticalSpan =
            board.RenderedSouthBoundary - board.RenderedNorthBoundary;
        const lockedDominoDistance = 6;

        // i = number of resizings so far
        for (let i = 0; i < 10; i++) {
            const F = 1 / (6 * i + 24);

            const minimumDimension = Math.min(
                gridWidthInPixels,
                gridHeightInPixels
            );
            const gridSquarePixelSize = F * minimumDimension;
            const gridWidthInSquares = Math.floor(
                gridWidthInPixels / gridSquarePixelSize
            );
            const gridHeightInSquares = Math.floor(
                gridHeightInPixels / gridSquarePixelSize
            );

            // Grid starts at (0, 0), shift by (1, 1) to conform to CSS-grid outside of this function
            const gridSquareHorizontalCenter = Math.floor(
                gridWidthInSquares / 2
            );
            const gridSquareVerticalCenter = Math.floor(
                gridHeightInSquares / 2
            );

            const baseDominoLayoutHorizontalCenter =
                (board.RenderedEastBoundary + board.RenderedWestBoundary) / 2;
            const baseDominoLayoutVerticalCenter =
                (board.RenderedNorthBoundary + board.RenderedSouthBoundary) / 2;

            const horizontalShift =
                gridSquareHorizontalCenter - baseDominoLayoutHorizontalCenter;
            const verticalShift =
                gridSquareVerticalCenter - baseDominoLayoutVerticalCenter;

            const translatedBoundingBoxes = boundingBoxes.map(
                (box) =>
                    ({
                        North: box.North + verticalShift,
                        East: box.East + horizontalShift,
                        South: box.South + verticalShift,
                        West: box.West + horizontalShift
                    } as BoundingBox)
            );

            if (i === 0) {
                // Check if the board fits at the base size, without bending
                if (
                    baseDominoLayoutVerticalSpan <= gridHeightInSquares &&
                    baseDominoLayoutHorizontalSpan <= gridWidthInSquares
                ) {
                    const dominoOrientationDirections = board.Dominoes.map(
                        (domino) => domino.Direction
                    );
                    return {
                        gridWidthInSquares,
                        gridHeightInSquares,
                        gridSquarePixelSize,
                        boundingBoxes: translatedBoundingBoxes,
                        dominoOrientationDirections
                    };
                }
            }

            // Board does not fit at original size, need to bend and/or shrink
            // First, to set up the grid, center the domino layout on the grid (will overflow,
            // but center of grid should match center of the current domino layout boundaries
            // Therefore our vertical and horizontal shifting occurs here
            // Make sure to round appropriately (if bigger dimension has odd # of squares)

            const fullyTranslatedBoundingBoxes = _.cloneDeep(
                translatedBoundingBoxes
            );

            // Now see if we need to translate the bounding boxes for the spinner
            if (board.Spinner) {
                // Check if the spinner and adjacent (within 6 square distance) dominoes are within
                // the non-bending area

                const translatedSpinnerBoundingBox =
                    fullyTranslatedBoundingBoxes[board.SpinnerIndex];

                const closeBoundingBoxes = fullyTranslatedBoundingBoxes.filter(
                    (box) =>
                        boundingBoxesAreClose(
                            translatedSpinnerBoundingBox,
                            box,
                            lockedDominoDistance
                        )
                );

                const closeDominoesFitWithoutBending = _.every(
                    closeBoundingBoxes.map((box) =>
                        boundingBoxFitsInGrid(
                            box,
                            gridWidthInSquares,
                            gridHeightInSquares
                        )
                    )
                );

                if (!closeDominoesFitWithoutBending) {
                    // translate bounding boxes the minimum necessary to give the spinner
                    // and adjacent dominoes enough margin
                    const closeBoundingBoxNorthLimit = Math.min(
                        ...closeBoundingBoxes.map((box) => box.North)
                    );
                    const closeBoundingBoxEastLimit = Math.max(
                        ...closeBoundingBoxes.map((box) => box.East)
                    );
                    const closeBoundingBoxSouthLimit = Math.max(
                        ...closeBoundingBoxes.map((box) => box.South)
                    );
                    const closeBoundingBoxWestLimit = Math.min(
                        ...closeBoundingBoxes.map((box) => box.West)
                    );

                    // At most two of the following conditions (one N/S, one E/W) can hold
                    // since with a closeness distance of 6, the max space that can be occupied
                    // by "close" dominoes is 22x24, while the minimum grid dimension is 24
                    if (closeBoundingBoxNorthLimit < 0) {
                        fullyTranslatedBoundingBoxes.forEach((box, i) => {
                            fullyTranslatedBoundingBoxes[i] =
                                translateBoundingBox(
                                    box,
                                    0,
                                    -1 * closeBoundingBoxNorthLimit
                                );
                        });
                    }
                    if (closeBoundingBoxSouthLimit > gridHeightInSquares) {
                        fullyTranslatedBoundingBoxes.forEach((box, i) => {
                            fullyTranslatedBoundingBoxes[i] =
                                translateBoundingBox(
                                    box,
                                    0,
                                    gridHeightInSquares -
                                        closeBoundingBoxSouthLimit
                                );
                        });
                    }
                    if (closeBoundingBoxEastLimit > gridWidthInSquares) {
                        fullyTranslatedBoundingBoxes.forEach((box, i) => {
                            fullyTranslatedBoundingBoxes[i] =
                                translateBoundingBox(
                                    box,
                                    gridWidthInSquares -
                                        closeBoundingBoxEastLimit,
                                    0
                                );
                        });
                    }
                    if (closeBoundingBoxWestLimit < 0) {
                        fullyTranslatedBoundingBoxes.forEach((box, i) => {
                            fullyTranslatedBoundingBoxes[i] =
                                translateBoundingBox(
                                    box,
                                    -1 * closeBoundingBoxWestLimit,
                                    0
                                );
                        });
                    }
                }
            }

            const fitsWithoutBending = fullyTranslatedBoundingBoxes.map((box) =>
                boundingBoxFitsInGrid(
                    box,
                    gridWidthInSquares,
                    gridHeightInSquares
                )
            );

            const boxesThatFitWithoutBending =
                fullyTranslatedBoundingBoxes.filter(
                    (box, i) => fitsWithoutBending[i]
                );
            const northLimitWithoutBending = Math.min(
                ...boxesThatFitWithoutBending.map((box) => box.North)
            );
            const northLimitBoundingBoxIndex =
                fullyTranslatedBoundingBoxes.findIndex(
                    (box, i) =>
                        box.North === northLimitWithoutBending &&
                        fitsWithoutBending[i]
                );
            const northLimitBoundingBox =
                fullyTranslatedBoundingBoxes[northLimitBoundingBoxIndex];

            const eastLimitWithoutBending = Math.max(
                ...boxesThatFitWithoutBending.map((box) => box.East)
            );
            const eastLimitBoundingBoxIndex =
                fullyTranslatedBoundingBoxes.findIndex(
                    (box, i) =>
                        box.East === eastLimitWithoutBending &&
                        fitsWithoutBending[i]
                );
            const eastLimitBoundingBox =
                fullyTranslatedBoundingBoxes[eastLimitBoundingBoxIndex];

            const southLimitWithoutBending = Math.max(
                ...boxesThatFitWithoutBending.map((box) => box.South)
            );
            const southLimitBoundingBoxIndex =
                fullyTranslatedBoundingBoxes.findIndex(
                    (box, i) =>
                        box.South === southLimitWithoutBending &&
                        fitsWithoutBending[i]
                );
            const southLimitBoundingBox =
                fullyTranslatedBoundingBoxes[southLimitBoundingBoxIndex];

            const westLimitWithoutBending = Math.min(
                ...boxesThatFitWithoutBending.map((box) => box.West)
            );
            const westLimitBoundingBoxIndex =
                fullyTranslatedBoundingBoxes.findIndex(
                    (box, i) =>
                        box.West === westLimitWithoutBending &&
                        fitsWithoutBending[i]
                );
            const westLimitBoundingBox =
                fullyTranslatedBoundingBoxes[westLimitBoundingBoxIndex];

            // Now the bounding boxes are set for bending

            const newBoundingBoxes = fullyTranslatedBoundingBoxes.map(
                (box, i) => {
                    // Keep all translated bounding boxes where they are if they fit inside the grid without bending
                    if (fitsWithoutBending[i]) {
                        return box;
                    } else {
                        if (box.North < 0) {
                            return bendBoundingBoxAroundPoint(
                                box,
                                northLimitBoundingBox.West,
                                northLimitBoundingBox.North + 2,
                                Direction.NORTH,
                                board.Dominoes[northLimitBoundingBoxIndex]
                                    .IsDouble
                            );
                        } else if (box.East > gridWidthInSquares) {
                            return bendBoundingBoxAroundPoint(
                                box,
                                eastLimitBoundingBox.East - 2,
                                eastLimitBoundingBox.North,
                                Direction.EAST,
                                board.Dominoes[eastLimitBoundingBoxIndex]
                                    .IsDouble
                            );
                        } else if (box.South > gridHeightInSquares) {
                            return bendBoundingBoxAroundPoint(
                                box,
                                southLimitBoundingBox.East,
                                southLimitBoundingBox.South - 2,
                                Direction.SOUTH,
                                board.Dominoes[southLimitBoundingBoxIndex]
                                    .IsDouble
                            );
                        } else if (box.West < 0) {
                            return bendBoundingBoxAroundPoint(
                                box,
                                westLimitBoundingBox.West + 2,
                                westLimitBoundingBox.South,
                                Direction.WEST,
                                board.Dominoes[westLimitBoundingBoxIndex]
                                    .IsDouble
                            );
                        } else {
                            throw new Error(
                                "Invalid bend attempted. Bounding box coordinates: " +
                                    JSON.stringify(box)
                            );
                        }
                    }
                }
            );

            const newDominoOrientationDirections = board.Dominoes.map(
                (domino, i) => {
                    if (fitsWithoutBending[i]) {
                        return domino.Direction;
                    } else {
                        return rotateDirectionClockwise(domino.Direction);
                    }
                }
            );
            // Now see if the bent dominoes actually fit

            const newSouthLimit = Math.max(
                ...newBoundingBoxes.map((box) => box.South)
            );
            const newNorthLimit = Math.min(
                ...newBoundingBoxes.map((box) => box.North)
            );
            const newEastLimit = Math.max(
                ...newBoundingBoxes.map((box) => box.East)
            );
            const newWestLimit = Math.min(
                ...newBoundingBoxes.map((box) => box.West)
            );

            const bentLayoutVerticalSpan = newSouthLimit - newNorthLimit;
            const bentLayoutHorizontalSpan = newEastLimit - newWestLimit;

            if (
                bentLayoutVerticalSpan <= gridHeightInSquares &&
                bentLayoutHorizontalSpan <= gridWidthInSquares
            ) {
                // Sometimes, even if the bent dominoes fit, they still need to be translated to fit the grid perfectly
                // This happens when there is no margin on an edge, and a bent double goes over the edge of the grid
                // A small (1 square) translation should fix things

                let finalBoundingBoxes = _.cloneDeep(newBoundingBoxes);
                if (newNorthLimit < 0) {
                    finalBoundingBoxes.forEach((box, i) => {
                        finalBoundingBoxes[i] = translateBoundingBox(
                            box,
                            0,
                            -1 * newNorthLimit
                        );
                    });
                }
                if (newSouthLimit > gridHeightInSquares) {
                    finalBoundingBoxes.forEach((box, i) => {
                        finalBoundingBoxes[i] = translateBoundingBox(
                            box,
                            0,
                            gridHeightInSquares - newSouthLimit
                        );
                    });
                }
                if (newEastLimit > gridWidthInSquares) {
                    finalBoundingBoxes.forEach((box, i) => {
                        finalBoundingBoxes[i] = translateBoundingBox(
                            box,
                            gridWidthInSquares - newEastLimit,
                            0
                        );
                    });
                }
                if (newWestLimit < 0) {
                    finalBoundingBoxes.forEach((box, i) => {
                        finalBoundingBoxes[i] = translateBoundingBox(
                            box,
                            -1 * newWestLimit,
                            0
                        );
                    });
                }

                return {
                    gridWidthInSquares,
                    gridHeightInSquares,
                    gridSquarePixelSize,
                    boundingBoxes: finalBoundingBoxes,
                    dominoOrientationDirections: newDominoOrientationDirections
                };
            }

            // If we get here, we need to shrink the grid square size again to get things to fit
        }

        // Did not return in for loop, passed max iterations to find a valid grid size. Return an error
        throw new Error("Could not resolve grid layout, fatal error");
    };

    const gridDescription = layoutDominoes(
        props.width,
        props.height,
        props.board
    );
    const gridHeightInSquares = gridDescription.gridHeightInSquares;
    const gridWidthInSquares = gridDescription.gridWidthInSquares;
    const gridSquarePixelSize = gridDescription.gridSquarePixelSize;
    const boundingBoxes = gridDescription.boundingBoxes;
    const dominoOrientationDirections =
        gridDescription.dominoOrientationDirections;

    const isDroppable = (domino: IBoardDomino) => {
        return (
            (domino === props.board.NorthEdge &&
                props.dominoBeingDragged?.ContainsNumber(
                    props.board.NorthExposedFace
                )) ||
            (domino === props.board.EastEdge &&
                props.dominoBeingDragged?.ContainsNumber(
                    props.board.EastExposedFace
                )) ||
            (domino === props.board.SouthEdge &&
                props.dominoBeingDragged?.ContainsNumber(
                    props.board.SouthExposedFace
                )) ||
            (domino === props.board.WestEdge &&
                props.dominoBeingDragged?.ContainsNumber(
                    props.board.WestExposedFace
                ))
        );
    };

    const determineDropDirectionForDomino = (domino: IBoardDomino) => {
        return props.board.NorthEdge === domino && props.board.CanPlayVertically
            ? Direction.NORTH
            : props.board.SouthEdge === domino && props.board.CanPlayVertically
            ? Direction.SOUTH
            : props.board.EastEdge === domino
            ? Direction.EAST
            : props.board.WestEdge === domino
            ? Direction.WEST
            : null;
    };

    return (
        <div
            className="board"
            ref={drop}
            style={{
                width: props.width,
                height: props.height,
                gridTemplateRows: `repeat(${gridHeightInSquares}, ${gridSquarePixelSize}px)`,
                gridTemplateColumns: `repeat(${gridWidthInSquares}, ${gridSquarePixelSize}px)`
            }}
        >
            {props.board.Dominoes.map((domino, i) => {
                const box = boundingBoxes[i];
                return (
                    <BoardDominoView
                        key={i}
                        north={box.North + 1} // Add 1 to convert to CSS-grid convention where top-left is (1, 1)
                        east={box.East + 1}
                        south={box.South + 1}
                        west={box.West + 1}
                        gridSize={gridSquarePixelSize}
                        onDropDomino={(item: { index: number }) => {
                            props.onDropDomino(
                                item,
                                determineDropDirectionForDomino(domino)
                            );
                        }}
                        face1={domino.Face1}
                        face2={domino.Face2}
                        direction={dominoOrientationDirections[i]}
                        highlight={isDroppable(domino)}
                    ></BoardDominoView>
                );
            })}
        </div>
    );
});
