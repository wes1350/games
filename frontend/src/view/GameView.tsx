import React from "react";
import { BoardView } from "./BoardView";
import { IGameState } from "model/GameStateModel";
import { MyPlayerView } from "./MyPlayerView";
import { OpponentPlayerView } from "./OpponentPlayerView";
import "./GameView.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { QueryType } from "enums/QueryType";
import { IPlayer } from "model/PlayerModel";
import { Direction } from "enums/Direction";
import { observer, useLocalObservable } from "mobx-react-lite";
import { action, runInAction } from "mobx";
import { GameEventRenderer } from "./GameEventRenderer";
import { GameOverDialog } from "./GameOverDialog";

interface IProps {
    gameState: IGameState;
    respond: (type: QueryType, value: any) => void;
    onEnterLobby: () => void;
}

export const GameView = observer((props: IProps) => {
    const localStore = useLocalObservable(() => ({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        dominoBeingDragged: null
    }));

    React.useEffect(() => {
        const handleWindowResizeForBoard = action(() => {
            localStore.windowWidth = window.innerWidth;
            localStore.windowHeight = window.innerHeight;
        });

        window.addEventListener("resize", handleWindowResizeForBoard);
    });

    const me = props.gameState.Players.find((player: IPlayer) => player.IsMe);
    return (
        <DndProvider backend={HTML5Backend}>
            <div className="game-view">
                <div
                    className={"board-container"}
                    style={{
                        top: localStore.windowHeight * 0.125 + 40, // 40 is from header height
                        left: localStore.windowWidth * 0.15
                    }}
                >
                    <BoardView
                        board={props.gameState.Board}
                        width={localStore.windowWidth * 0.7}
                        height={localStore.windowHeight * 0.7 - 40} // 40 is from header height
                        onDropDomino={(
                            item: { index: number },
                            direction: Direction
                        ) => {
                            props.respond(props.gameState.CurrentQueryType, {
                                domino: item.index,
                                direction: direction
                            });
                        }}
                        dominoBeingDragged={localStore.dominoBeingDragged}
                    />
                </div>
                <div className={"player-container"}>
                    {props.gameState.Players.filter(
                        (player: IPlayer) => !player.IsMe
                    ).map((player: IPlayer, i: number) => {
                        return (
                            <OpponentPlayerView
                                key={i}
                                index={props.gameState.SeatToPositionMapping.get(
                                    player.SeatNumber
                                )}
                                player={player}
                                current={
                                    props.gameState.CurrentPlayerIndex ===
                                    player.SeatNumber
                                }
                                windowWidth={localStore.windowWidth}
                                windowHeight={localStore.windowHeight}
                            />
                        );
                    })}
                    <MyPlayerView
                        player={me}
                        current={
                            props.gameState.CurrentPlayerIndex === me.SeatNumber
                        }
                        onStartDrag={(index: number) => {
                            runInAction(() => {
                                localStore.dominoBeingDragged =
                                    props.gameState.CurrentPlayer.Hand[index];
                            });
                        }}
                        onStopDrag={() => {
                            runInAction(() => {
                                localStore.dominoBeingDragged = null;
                            });
                        }}
                    />
                </div>
                <GameEventRenderer
                    event={props.gameState.CurrentEvent}
                    index={
                        props.gameState.SeatToPositionMapping.get(
                            props.gameState.CurrentEvent?.Seat
                        ) ?? null
                    }
                    clearEvent={action(() => {
                        props.gameState.ClearEvent();
                    })}
                />
                {props.gameState.GameOver && (
                    <GameOverDialog
                        winner={props.gameState.Winner}
                        onEnterLobby={props.onEnterLobby}
                    />
                )}
            </div>
        </DndProvider>
    );
});
