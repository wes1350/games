import { observer } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import "./GameLogs.css";

interface IProps {
    logs: string[];
}

export const GameLogs = observer((props: IProps) => {
    const endOfLogsRef = useRef(null);

    const scrollToBottom = () => {
        endOfLogsRef.current?.scrollIntoView();
    };

    useEffect(() => {
        scrollToBottom();
    }, [props.logs.length]);

    return (
        <div className={"game-logs-container"}>
            {props.logs.map((log, i) => {
                return log.trim() ? (
                    <div key={i}>{log}</div>
                ) : (
                    <div key={i}>&nbsp;</div>
                );
            })}
            <div ref={endOfLogsRef}></div>
        </div>
    );
});
