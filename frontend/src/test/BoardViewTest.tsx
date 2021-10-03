import React from "react";
import { observer, useLocalObservable } from "mobx-react-lite";
import { Board } from "model/BoardModel";
import { BoardView } from "view/BoardView";
import { Direction } from "enums/Direction";
import { Domino } from "model/DominoModel";
import { Coordinate } from "interfaces/Coordinate";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./BoardViewTest.css";
import { action } from "mobx";

interface IProps {}

export const BoardViewTest = observer((props: IProps) => {
    const localStore = useLocalObservable(() => ({
        width: window.innerWidth,
        height: window.innerHeight
    }));

    React.useEffect(() => {
        const handleWindowResizeForBoard = action(() => {
            localStore.width = window.innerWidth;
            localStore.height = window.innerHeight;
        });

        window.addEventListener("resize", handleWindowResizeForBoard);
    });

    const board = Board.create({});

    // const addedDominoesSpec = [
    //     { Face1: 6, Face2: 6, X: 0, Y: 0, Direction: Direction.SOUTH },
    //     { Face1: 6, Face2: 3, X: 1, Y: 0, Direction: Direction.EAST },
    //     { Face1: 3, Face2: 1, X: 2, Y: 0, Direction: Direction.EAST },
    //     { Face1: 1, Face2: 1, X: 3, Y: 0, Direction: Direction.SOUTH },
    //     { Face1: 1, Face2: 4, X: 4, Y: 0, Direction: Direction.EAST },
    //     { Face1: 6, Face2: 5, X: -1, Y: 0, Direction: Direction.WEST },
    //     { Face1: 5, Face2: 2, X: -2, Y: 0, Direction: Direction.WEST },
    //     { Face1: 2, Face2: 0, X: -3, Y: 0, Direction: Direction.WEST },
    //     { Face1: 3, Face2: 0, X: -4, Y: 0, Direction: Direction.EAST },
    //     { Face1: 6, Face2: 3, X: 0, Y: -1, Direction: Direction.SOUTH },
    //     { Face1: 6, Face2: 4, X: 0, Y: 1, Direction: Direction.NORTH },
    //     { Face1: 4, Face2: 4, X: 0, Y: 2, Direction: Direction.EAST },
    //     { Face1: 4, Face2: 5, X: 0, Y: 3, Direction: Direction.NORTH },
    //     { Face1: 4, Face2: 2, X: 5, Y: 0, Direction: Direction.EAST },
    //     { Face1: 2, Face2: 1, X: 6, Y: 0, Direction: Direction.EAST },
    //     { Face1: 1, Face2: 1, X: 7, Y: 0, Direction: Direction.SOUTH },
    //     { Face1: 1, Face2: 5, X: 8, Y: 0, Direction: Direction.EAST },
    //     { Face1: 5, Face2: 5, X: 9, Y: 0, Direction: Direction.SOUTH },
    //     { Face1: 3, Face2: 0, X: 0, Y: -2, Direction: Direction.SOUTH },
    //     { Face1: 5, Face2: 5, X: 0, Y: 4, Direction: Direction.EAST },
    //     { Face1: 6, Face2: 5, X: 0, Y: 5, Direction: Direction.SOUTH },
    //     { Face1: 5, Face2: 2, X: 10, Y: 0, Direction: Direction.EAST },
    //     { Face1: 2, Face2: 1, X: 11, Y: 0, Direction: Direction.EAST },
    //     { Face1: 1, Face2: 0, X: 12, Y: 0, Direction: Direction.EAST },
    //     { Face1: 0, Face2: 0, X: 13, Y: 0, Direction: Direction.SOUTH },
    //     { Face1: 4, Face2: 0, X: 0, Y: -3, Direction: Direction.NORTH },
    //     { Face1: 4, Face2: 4, X: 0, Y: -4, Direction: Direction.EAST }
    // ];

    // const addedDominoesSpec = [
    //     { Face1: 6, Face2: 6, X: 0, Y: 0, Direction: Direction.SOUTH },
    //     { Face1: 6, Face2: 0, X: -1, Y: 0, Direction: Direction.WEST },
    //     { Face1: 0, Face2: 2, X: -2, Y: 0, Direction: Direction.WEST },
    //     { Face1: 2, Face2: 2, X: -3, Y: 0, Direction: Direction.SOUTH },
    //     { Face1: 2, Face2: 1, X: -4, Y: 0, Direction: Direction.WEST },
    //     { Face1: 6, Face2: 1, X: 1, Y: 0, Direction: Direction.EAST },
    //     { Face1: 3, Face2: 1, X: 2, Y: 0, Direction: Direction.WEST },
    //     { Face1: 3, Face2: 2, X: 3, Y: 0, Direction: Direction.EAST },
    //     { Face1: 6, Face2: 2, X: 4, Y: 0, Direction: Direction.WEST },
    //     { Face1: 6, Face2: 4, X: 0, Y: 1, Direction: Direction.NORTH },
    //     { Face1: 4, Face2: 2, X: 0, Y: 2, Direction: Direction.NORTH },
    //     { Face1: 6, Face2: 3, X: 0, Y: -1, Direction: Direction.SOUTH },
    //     { Face1: 5, Face2: 3, X: 0, Y: -2, Direction: Direction.NORTH },
    //     { Face1: 5, Face2: 1, X: 0, Y: -3, Direction: Direction.SOUTH },
    //     { Face1: 4, Face2: 1, X: 0, Y: -4, Direction: Direction.NORTH },
    //     { Face1: 5, Face2: 4, X: 0, Y: -5, Direction: Direction.NORTH },
    //     { Face1: 5, Face2: 5, X: 0, Y: -6, Direction: Direction.EAST }
    // ];

    const addedDominoesSpec = [
        { Face1: 6, Face2: 6, X: 0, Y: 0, Direction: Direction.SOUTH },

        { Face1: 6, Face2: 4, X: -1, Y: 0, Direction: Direction.WEST },
        { Face1: 5, Face2: 4, X: -2, Y: 0, Direction: Direction.EAST },
        { Face1: 5, Face2: 5, X: -3, Y: 0, Direction: Direction.SOUTH },

        { Face1: 6, Face2: 5, X: 1, Y: 0, Direction: Direction.EAST },

        { Face1: 6, Face2: 0, X: 0, Y: -1, Direction: Direction.SOUTH },
        { Face1: 0, Face2: 0, X: 0, Y: -2, Direction: Direction.WEST },
        { Face1: 3, Face2: 0, X: 0, Y: -3, Direction: Direction.NORTH },
        { Face1: 5, Face2: 3, X: 0, Y: -4, Direction: Direction.NORTH },
        { Face1: 5, Face2: 1, X: 0, Y: -5, Direction: Direction.SOUTH },
        { Face1: 3, Face2: 1, X: 0, Y: -6, Direction: Direction.NORTH },
        { Face1: 4, Face2: 3, X: 0, Y: -7, Direction: Direction.NORTH },
        { Face1: 4, Face2: 0, X: 0, Y: -8, Direction: Direction.SOUTH },
        { Face1: 2, Face2: 0, X: 0, Y: -9, Direction: Direction.NORTH },

        { Face1: 6, Face2: 1, X: 0, Y: 1, Direction: Direction.NORTH },
        { Face1: 1, Face2: 0, X: 0, Y: 2, Direction: Direction.NORTH },
        { Face1: 5, Face2: 0, X: 0, Y: 3, Direction: Direction.SOUTH },
        { Face1: 5, Face2: 4, X: 0, Y: 4, Direction: Direction.NORTH }
    ];

    addedDominoesSpec.forEach((desc) => {
        board.AddDomino(
            Domino.create({ Face1: desc.Face1, Face2: desc.Face2 }),
            desc.Direction,
            { X: desc.X, Y: desc.Y } as Coordinate
        );
    });

    return (
        <DndProvider backend={HTML5Backend}>
            <div className={"board-view-test"}>
                <div className={"board-view-test-board-container"}>
                    <BoardView
                        height={localStore.height}
                        width={localStore.width}
                        onDropDomino={() => {}}
                        dominoBeingDragged={null}
                        board={board}
                    />
                </div>
            </div>
        </DndProvider>
    );
});
