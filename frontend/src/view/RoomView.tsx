import { PlayerDataContext } from "context/PlayerDataContext";
import { SocketContext } from "context/SocketContext";
import { Direction } from "enums/Direction";
import { GameEventType } from "enums/GameEventType";
import { MessageType } from "enums/MessageType";
import { QueryType } from "enums/QueryType";
import { Coordinate } from "interfaces/Coordinate";
import {
    GameLogMessage,
    GameStartMessage,
    NewRoundMessage
} from "interfaces/Messages";
import { action, runInAction, when } from "mobx";
import { observer, useLocalObservable } from "mobx-react-lite";
import { SnapshotIn } from "mobx-state-tree";
import { Board } from "model/BoardModel";
import { Domino, IDomino } from "model/DominoModel";
import { GameConfig } from "model/GameConfigModel";
import { GameState } from "model/GameStateModel";
import { Player } from "model/PlayerModel";
import React, { useContext } from "react";
import {
    Redirect,
    Route,
    Switch,
    useHistory,
    useParams,
    useRouteMatch
} from "react-router-dom";
import { generateId } from "utils/utils";
import { RoomLobbyView } from "./RoomLobbyView";
import { GameView } from "./GameView";
import { PossiblePlaysMessage } from "interfaces/PossiblePlaysMessage";
import _ from "lodash";

interface IProps {}

type RoomParams = {
    roomId: string;
};

export const RoomView = observer((props: IProps) => {
    const playerDataContext = useContext(PlayerDataContext);
    const playerName = playerDataContext.name;

    const socketContext = useContext(SocketContext);
    const socket = socketContext?.socket;

    const { roomId } = useParams<RoomParams>();

    const localStore = useLocalObservable(() => ({
        gameState: null,
        roomDetails: null
    }));

    const history = useHistory();

    const joinRoom = () => {
        socket.emit(MessageType.JOIN_ROOM, roomId);
    };

    React.useEffect(() => {
        if (socket && playerName) {
            initializeLobby();
        }
    }, [socketContext, playerDataContext]);

    const match = useRouteMatch();

    const initializeLobby = () => {
        joinRoom();
        setUpSocketForLobby();
    };

    const roomDetailsListener = (roomDetails: { name: string }[]) => {
        runInAction(() => {
            localStore.roomDetails = roomDetails;
        });
    };

    const setUpSocketForLobby = () => {
        socket.on(MessageType.ROOM_DETAILS, roomDetailsListener);

        // Might need to add some sort of socket.offAll() in case of reconnects
        socket.once(MessageType.GAME_START, (gameDetails: GameStartMessage) => {
            console.log("starting game, details:", JSON.stringify(gameDetails));
            runInAction(() => {
                localStore.gameState = initializeGameState(gameDetails);
            });
            addGameplayListeners();
            history.push(`/room/${roomId}/game`);

            socket.off(MessageType.ROOM_DETAILS, roomDetailsListener);
        });
    };

    const initializeGameState = (gameDetails: GameStartMessage) => {
        const gameConfig = GameConfig.create({
            HAND_SIZE: gameDetails.config.n_dominoes,
            N_PLAYERS: gameDetails.players.length
        });
        const newGameState = GameState.create({
            Config: gameConfig,
            Board: Board.create({})
        });

        gameDetails.players.forEach((player) => {
            newGameState.AddPlayer(
                Player.create({
                    Name: player.name,
                    SeatNumber: player.seatNumber,
                    IsMe: player.isMe
                })
            );
        });

        newGameState.Start();
        return newGameState;
    };

    const gameLogListener = (logDetails: GameLogMessage) => {
        console.log(logDetails);
        localStore.gameState.AddLog(logDetails.message);
    };

    const turnListener = (turnDescription: {
        seat: number;
        domino: SnapshotIn<IDomino>;
        direction: Direction;
        coordinate: Coordinate;
    }) => {
        const domino = turnDescription.domino
            ? Domino.create(turnDescription.domino)
            : null;

        localStore.gameState.ProcessTurn(
            domino,
            turnDescription.direction,
            turnDescription.coordinate
        );
        localStore.gameState.Me.SetPlayableDominoes(null);

        if (!domino) {
            localStore.gameState.AddEvent({
                Id: Math.floor(Math.random() * 10000000),
                Type: GameEventType.PASS,
                Duration: 1000,
                Seat: turnDescription.seat
            });
        }
    };

    const scoreListener = (payload: { seat: number; score: number }) => {
        localStore.gameState.AddEvent({
            Id: Math.floor(Math.random() * 10000000),
            Type: GameEventType.SCORE,
            Duration: 1000,
            Seat: payload.seat,
            Score: payload.score
        });

        localStore.gameState.ProcessScore(payload.seat, payload.score);
    };

    const handListener = (payload: { Face1: number; Face2: number }[]) => {
        when(
            () => localStore.gameState.Events.length === 0,
            () => {
                localStore.gameState.Me.SetHand(payload as IDomino[]);
            }
        );
    };

    const playableDominoesListener = (payload: PossiblePlaysMessage) => {
        localStore.gameState.Me.SetPlayableDominoes(
            _.uniq(payload.plays.map((play) => play.domino))
        );
    };

    const dominoPlayedListener = (payload: { seat: number }) => {
        const player = localStore.gameState.PlayerAtSeat(payload.seat);
        if (!player.IsMe) {
            player.RemoveDomino();
        }
    };

    const clearBoardListener = () => {
        when(
            () => localStore.gameState.Events.length === 0,
            () => {
                localStore.gameState.ClearBoard();
            }
        );
    };

    const pullListener = (payload: { seat: number }) => {
        const player = localStore.gameState.PlayerAtSeat(payload.seat);
        if (!player.IsMe) {
            player.AddDomino(Domino.create({ Face1: -1, Face2: -1 }));
        }
    };

    const newRoundListener = (payload: NewRoundMessage) => {
        when(
            () => localStore.gameState.Events.length === 0,
            () => {
                localStore.gameState.SetCurrentPlayerIndex(
                    payload.currentPlayer
                );
                localStore.gameState.InitializeOpponentHands();
            }
        );
    };

    const moveListener = (message: string) => {
        localStore.gameState.SetQueryType(QueryType.MOVE);
    };

    const gameOverListener = (winner: string) => {
        setTimeout(() => {
            localStore.gameState.Finish(winner);
        }, 1000);
    };

    const gameBlockedListener = () => {
        localStore.gameState.AddEvent({
            Id: generateId(),
            Type: GameEventType.BLOCKED,
            Duration: 2000
        });
    };

    const addGameplayListeners = () => {
        socket.on(MessageType.GAME_LOG, gameLogListener);
        socket.on(MessageType.TURN, turnListener);
        socket.on(MessageType.SCORE, scoreListener);
        socket.on(MessageType.HAND, handListener);
        socket.on(MessageType.POSSIBLE_PLAYS, playableDominoesListener);
        socket.on(MessageType.DOMINO_PLAYED, dominoPlayedListener);
        socket.on(MessageType.CLEAR_BOARD, clearBoardListener);
        socket.on(MessageType.PULL, pullListener);
        socket.on(MessageType.NEW_ROUND, newRoundListener);
        socket.on(QueryType.MOVE, moveListener);
        socket.on(MessageType.GAME_OVER, gameOverListener);
        socket.on(MessageType.GAME_BLOCKED, gameBlockedListener);

        when(
            () => localStore.gameState === null,
            () => {
                socket.off(MessageType.GAME_LOG, gameLogListener);
                socket.off(MessageType.TURN, turnListener);
                socket.off(MessageType.SCORE, scoreListener);
                socket.off(MessageType.HAND, handListener);
                socket.off(
                    MessageType.POSSIBLE_PLAYS,
                    playableDominoesListener
                );
                socket.off(MessageType.DOMINO_PLAYED, dominoPlayedListener);
                socket.off(MessageType.CLEAR_BOARD, clearBoardListener);
                socket.off(MessageType.PULL, pullListener);
                socket.off(MessageType.NEW_ROUND, newRoundListener);
                socket.off(QueryType.MOVE, moveListener);
                socket.off(MessageType.GAME_OVER, gameOverListener);
                socket.off(MessageType.GAME_BLOCKED, gameBlockedListener);
            }
        );
    };

    const onReenterLobby = action(() => {
        localStore.gameState = null;
        localStore.roomDetails = null;
        initializeLobby();
    });

    const respondToQuery = (type: QueryType, value: any) => {
        socket.emit(type, value);
    };

    if (!socket) {
        return null;
    }

    const lobbyURL = `${match.url}/lobby`;
    const gameURL = `${match.url}/game`;

    return (
        <div className="room-view">
            <Switch>
                <Route path={lobbyURL}>
                    <RoomLobbyView
                        roomId={roomId}
                        roomDetails={localStore.roomDetails}
                    />
                </Route>
                {localStore.gameState && (
                    <Route path={gameURL}>
                        <GameView
                            gameState={localStore.gameState}
                            respond={respondToQuery}
                            onEnterLobby={onReenterLobby}
                        ></GameView>
                    </Route>
                )}
                <Redirect from="*" to={lobbyURL} />
            </Switch>
        </div>
    );
});
