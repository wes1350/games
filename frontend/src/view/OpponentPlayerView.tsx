import React, { useRef } from "react";
import { OpponentHandDominoView } from "./OpponentHandDominoView";
import { action, runInAction } from "mobx";
import { observer, useLocalObservable } from "mobx-react-lite";
import { IPlayer } from "model/PlayerModel";
import "./PlayerView.css";

interface IProps {
    index: number;
    player: IPlayer;
    current: boolean;
    windowWidth: number;
    windowHeight: number;
}

export const OpponentPlayerView = observer((props: IProps) => {
    const handRef = useRef<HTMLDivElement>(null);

    const localStore = useLocalObservable(() => ({
        handWidth: 0,
        handHeight: 0
    }));

    React.useEffect(() => {
        const handWidth = handRef?.current?.clientWidth;
        const handHeight = handRef?.current?.clientHeight;

        if (!localStore.handHeight || !localStore.handWidth) {
            runInAction(() => {
                localStore.handWidth = handWidth;
                localStore.handHeight = handHeight;
            });
        }

        const handleWindowResizeForDomino = action(() => {
            localStore.handWidth = handRef?.current?.clientWidth;
            localStore.handHeight = handRef?.current?.clientHeight;
        });

        window.addEventListener("resize", handleWindowResizeForDomino);
    });

    const borderlessProperty =
        props.index === 1
            ? "borderTop"
            : props.index === 2
            ? "borderLeft"
            : "borderRight";

    const layoutType = props.index === 1 ? "horizontal" : "vertical";

    const smallSideSize = Math.min(props.windowWidth, props.windowHeight) * 0.1;
    const smallSideStyle = {
        [props.index === 1 ? "height" : "width"]: `${smallSideSize}px`
    };

    return (
        <div
            className={`player-view player-view-${layoutType} opponent opponent-${
                props.index
            } ${props.current ? " current" : ""}`}
            style={{ [borderlessProperty]: "0px", ...smallSideStyle }}
        >
            <div
                ref={handRef}
                className={`hand-container hand-container-${layoutType}`}
            >
                <div className={`hand-wrapper hand-wrapper-${layoutType}`}>
                    {props.player.Hand.map((domino, i) => {
                        return (
                            <div key={i} className={"hand-domino-container"}>
                                <OpponentHandDominoView
                                    playerIndex={props.index}
                                    longSideSize={
                                        props.index === 1
                                            ? localStore.handHeight
                                            : localStore.handWidth
                                    }
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div
                className={`player-details player-details-${layoutType} player-details-${props.index}`}
            >
                <div className={`player-name player-name-${props.index}`}>
                    {props.player.Name}
                </div>
                <div className={`player-score player-score-${props.index}`}>
                    Score: {props.player.Score}
                </div>
            </div>
        </div>
    );
});
