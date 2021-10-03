import React, { useRef } from "react";
import "./DominoView.css";
import { Direction } from "enums/Direction";
import { observer } from "mobx-react-lite";

interface IProps {
    face1: number;
    face2: number;
    direction: Direction;
    width: number;
    height: number;
    highlight?: boolean;
}

export const DominoView = observer((props: IProps) => {
    const dominoContainerRef = useRef<HTMLDivElement>(null);

    const isReversed =
        props.direction === Direction.WEST ||
        props.direction === Direction.NORTH;
    const isVertical =
        props.direction === Direction.NORTH ||
        props.direction === Direction.SOUTH;
    const isHiddenDomino = props.face1 === -1 || props.face2 === -1;
    const dominoBackgroundFill = "#F7EEE1";
    const dominoFeatureFill = "#000";
    const shrinkFactor = 0.975;
    const highlightOverflowFactor = 1.2;

    const getFaceCircles = (number: number, addOffset: boolean) => {
        const offset = addOffset ? 50 : 0;
        let x1, x2, x3, y1, y2, y3;
        if (isVertical) {
            x1 = "25%";
            x2 = "50%";
            x3 = "75%";
            y1 = `${12.5 + offset}%`;
            y2 = `${25 + offset}%`;
            y3 = `${37.5 + offset}%`;
        } else {
            y1 = "25%";
            y2 = "50%";
            y3 = "75%";
            x1 = `${12.5 + offset}%`;
            x2 = `${25 + offset}%`;
            x3 = `${37.5 + offset}%`;
        }
        const r = "5%";
        const fill = "#000";

        const circles = [];
        if ([2, 3, 4, 5, 6].includes(number)) {
            circles.push(<circle key={1} cx={x1} cy={y1} r={r} fill={fill} />);
        }
        if ([6].includes(number)) {
            circles.push(<circle key={2} cx={x1} cy={y2} r={r} fill={fill} />);
        }
        if ([4, 5, 6].includes(number)) {
            circles.push(<circle key={3} cx={x1} cy={y3} r={r} fill={fill} />);
        }
        if ([1, 3, 5].includes(number)) {
            circles.push(<circle key={5} cx={x2} cy={y2} r={r} fill={fill} />);
        }
        if ([4, 5, 6].includes(number)) {
            circles.push(<circle key={7} cx={x3} cy={y1} r={r} fill={fill} />);
        }
        if ([6].includes(number)) {
            circles.push(<circle key={8} cx={x3} cy={y2} r={r} fill={fill} />);
        }
        if ([2, 3, 4, 5, 6].includes(number)) {
            circles.push(<circle key={9} cx={x3} cy={y3} r={r} fill={fill} />);
        }
        return circles;
    };

    let highlightTransform;
    const shift = 50 * (highlightOverflowFactor - 1);
    if (isVertical) {
        highlightTransform = `translate(-${shift}%,-${shift / 2}%)`;
    } else {
        highlightTransform = `translate(-${shift / 2}%,-${shift}%)`;
    }

    return (
        <>
            <div ref={dominoContainerRef} className={"domino-outer-container"}>
                {props.highlight && (
                    <div
                        className="domino-drop-highlight"
                        style={{
                            position: "absolute",
                            backgroundColor: "#9d4",
                            width: isVertical
                                ? highlightOverflowFactor * props.width
                                : ((1 + highlightOverflowFactor) / 2) *
                                  props.width,
                            height: isVertical
                                ? ((1 + highlightOverflowFactor) / 2) *
                                  props.height
                                : highlightOverflowFactor * props.height,
                            zIndex: 0,
                            borderRadius: "10%",
                            transform: highlightTransform
                        }}
                    ></div>
                )}
                <div className={"domino-svg-container"}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={"100%"}
                        height={"100%"}
                        version="1.1"
                    >
                        <rect
                            x={`${(100 * (1 - shrinkFactor)) / 2}%`}
                            y={`${(100 * (1 - shrinkFactor)) / 2}%`}
                            width={`${100 * shrinkFactor}%`}
                            height={`${100 * shrinkFactor}%`}
                            rx={isVertical ? "10%" : "5%"}
                            fill={dominoBackgroundFill}
                        />

                        {!isHiddenDomino && (
                            <>
                                {getFaceCircles(
                                    isReversed ? props.face2 : props.face1,
                                    false
                                )}

                                {isVertical ? (
                                    <line
                                        x1="5%"
                                        y1="50%"
                                        x2="95%"
                                        y2="50%"
                                        stroke={dominoFeatureFill}
                                        strokeWidth="1.5%"
                                    />
                                ) : (
                                    <line
                                        y1="5%"
                                        x1="50%"
                                        y2="95%"
                                        x2="50%"
                                        stroke={dominoFeatureFill}
                                        strokeWidth="1.5%"
                                    />
                                )}
                                {getFaceCircles(
                                    isReversed ? props.face1 : props.face2,
                                    true
                                )}
                            </>
                        )}
                    </svg>
                </div>
            </div>
        </>
    );
});
