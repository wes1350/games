import React from "react";
import { observer } from "mobx-react-lite";
import { GameEvent } from "interfaces/GameEvent";
import "./GameEventRenderer.css";
import { GameEventType } from "enums/GameEventType";

interface IProps {
    event?: GameEvent;
    index?: number;
    clearEvent: () => void;
}

export const GameEventRenderer = observer((props: IProps) => {
    React.useEffect(() => {
        if (props.event) {
            setTimeout(() => {
                props.clearEvent();
            }, props.event.Duration);
        }
    }, [props.event?.Id]);

    const gameEventClass =
        props.index === null
            ? ""
            : props.index === 0
            ? " game-event-me"
            : ` game-event-opponent-${props.index}`;

    const eventType = props.event?.Type;

    const gameEventText =
        eventType === GameEventType.SCORE
            ? `+ ${props.event.Score}`
            : eventType === GameEventType.PASS
            ? "Pass"
            : eventType === GameEventType.BLOCKED
            ? "Board blocked"
            : props.event?.Type;

    return (
        <div className="game-event-renderer">
            {!!props.event && (
                <div className={`game-event${gameEventClass}`}>
                    {gameEventText}
                </div>
            )}
        </div>
    );
});
