import React from "react";
import { observer } from "mobx-react-lite";
import { DominoView } from "./DominoView";
import { Direction } from "enums/Direction";

interface IProps {
    playerIndex: number;
    longSideSize: number;
}

export const OpponentHandDominoView = observer((props: IProps) => {
    if (!props.longSideSize) {
        return null;
    }

    const isAcross = props.playerIndex === 1;
    const margin = 3;
    return (
        <div
            className={"hand-domino-container"}
            style={{
                margin: `${margin}px`,
                height: (isAcross ? 1 : 0.5) * (props.longSideSize - margin),
                width: (isAcross ? 0.5 : 1) * (props.longSideSize - margin)
            }}
        >
            <DominoView
                face1={-1}
                face2={-1}
                width={(isAcross ? 0.5 : 1) * props.longSideSize}
                height={(isAcross ? 1 : 0.5) * props.longSideSize}
                direction={
                    props.playerIndex === 1 ? Direction.SOUTH : Direction.EAST
                }
            />
        </div>
    );
});
