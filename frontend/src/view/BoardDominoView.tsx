import { Direction } from "enums/Direction";
import { DragItemTypes } from "enums/DragItemTypes";
import { action, runInAction } from "mobx";
import { observer, useLocalObservable } from "mobx-react-lite";
import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import { DominoView } from "./DominoView";
import "./DominoView.css";

interface IProps {
    north: number;
    east: number;
    south: number;
    west: number;
    face1: number;
    face2: number;
    direction: Direction;
    highlight?: boolean;
    gridSize: number;
    onDropDomino: (item: { index: number }) => void;
}

export const BoardDominoView = observer((props: IProps) => {
    const [, drop] = useDrop(() => ({
        accept: DragItemTypes.DOMINO,
        drop: (item: { index: number }, monitor) => {
            props.onDropDomino(item);
        },
        collect: (monitor) => ({
            // isOver: !!monitor.isOver(),
            // canDrop: true
            // isDragging: (monitor as any).internalMonitor.isDragging()
        })
    }));

    const boardDominoRef = useRef<HTMLDivElement>(null);

    const localStore = useLocalObservable(() => ({
        width: null,
        height: null
    }));

    React.useEffect(() => {
        const containerWidth = boardDominoRef?.current?.clientWidth;
        const containerHeight = boardDominoRef?.current?.clientHeight;

        runInAction(() => {
            localStore.width = containerWidth;
            localStore.height = containerHeight;
        });

        const handleWindowResizeForContainer = action(() => {
            localStore.width = boardDominoRef?.current?.clientWidth;
            localStore.height = boardDominoRef?.current?.clientHeight;
        });

        window.addEventListener("resize", handleWindowResizeForContainer);
    });

    return (
        <div
            className="board-domino-view"
            ref={drop}
            style={{
                gridArea: `${props.north} / ${props.west} / ${props.south} / ${props.east}`
            }}
        >
            <div ref={boardDominoRef} className="board-domino-wrapper">
                <DominoView
                    face1={props.face1}
                    face2={props.face2}
                    direction={props.direction}
                    highlight={props.highlight}
                    width={localStore.width}
                    height={localStore.height}
                />
            </div>
        </div>
    );
});
