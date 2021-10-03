import React from "react";
import "./GameOverDialog.css";
import { observer } from "mobx-react-lite";

interface IProps {
    winner: string;
    onEnterLobby: () => void;
}

export const GameOverDialog = observer((props: IProps) => {
    return (
        <div className="game-over-dialog">
            <div className="winner-name">{props.winner} wins!</div>
            <div className="back-to-lobby-button-container">
                <button
                    className="back-to-lobby-button"
                    onClick={props.onEnterLobby}
                >
                    Back to room lobby
                </button>
            </div>
        </div>
    );
});
