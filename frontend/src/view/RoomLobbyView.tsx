import React, { useContext } from "react";
import { observer, useLocalObservable } from "mobx-react-lite";
import { GameConfigDescription } from "interfaces/GameConfigDescription";
import { MessageType } from "enums/MessageType";
import "./RoomLobbyView.css";
import { useHistory } from "react-router-dom";
import { SocketContext } from "context/SocketContext";
import { action } from "mobx";

interface IProps {
    roomId: string;
    roomDetails: { name: string }[];
}

export const RoomLobbyView = observer((props: IProps) => {
    const localStore = useLocalObservable(() => ({
        handSize: "7",
        check5Doubles: "Yes",
        winThreshold: "150"
    }));

    const history = useHistory();

    const socket = useContext(SocketContext)?.socket;

    const onSubmit = (e: any) => {
        e.preventDefault();
        const config = {
            HandSize: parseInt(localStore.handSize),
            WinThreshold: parseInt(localStore.winThreshold),
            Check_5_Doubles: localStore.check5Doubles === "Yes"
        } as GameConfigDescription;
        console.log(config);
        socket.emit(MessageType.GAME_START, props.roomId, config);
    };

    const onChangeHandSize = action((e: any) => {
        localStore.handSize = e.currentTarget.value;
    });

    const onChangeWinThreshold = action((e: any) => {
        localStore.winThreshold = e.target.value;
    });

    const onChange5DoublesSetting = action((e: any) => {
        localStore.check5Doubles = e.currentTarget.checked;
    });

    const onLeaveRoom = () => {
        socket.emit(MessageType.LEAVE_ROOM, props.roomId, {
            name: "username"
        });
        history.push("/");
    };

    if (!socket) {
        return null;
    }

    return (
        <div className="room-lobby">
            <div className="leave-room-button-container">
                <button onClick={onLeaveRoom}>Leave Room</button>
            </div>
            <div className="players-in-lobby-container">
                <div className="players-in-lobby-container-label">
                    Players in room:
                </div>
                <>
                    {props.roomDetails?.map((playerDetails, i) => (
                        <div key={i} className="players-in-lobby-item">
                            {playerDetails.name}
                        </div>
                    ))}
                </>
            </div>
            <div className={"game-start-form"}>
                <form onSubmit={onSubmit}>
                    <div className={"game-config-dropdown-container"}>
                        <label>
                            Hand size:
                            <select
                                value={localStore.handSize}
                                onChange={onChangeHandSize}
                            >
                                <option value="5">5</option>
                                <option value="7">7</option>
                                <option value="9">9</option>
                            </select>
                        </label>
                    </div>
                    <div className={"game-config-dropdown-container"}>
                        <label>
                            Win threshold:
                            <select
                                value={localStore.winThreshold}
                                onChange={onChangeWinThreshold}
                            >
                                <option value="5">5</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="150">150</option>
                                <option value="200">200</option>
                                <option value="250">250</option>
                            </select>
                        </label>
                    </div>
                    <div className={"game-config-dropdown-container"}>
                        <label>
                            Disallow 5 doubles:
                            <select
                                value={localStore.check5Doubles}
                                onChange={onChange5DoublesSetting}
                            >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </label>
                    </div>
                    <div className={"game-config-submit-button"}>
                        <button type="submit">Start Game</button>
                    </div>
                </form>
            </div>
        </div>
    );
});
