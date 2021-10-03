import React, { useContext } from "react";
import { observer, useLocalObservable } from "mobx-react-lite";
import { PlayerDataContext } from "./PlayerDataContext";
import { action } from "mobx";
const io = require("socket.io-client");

interface IProps {
    children: any;
}

export const SocketContext = React.createContext({
    socket: null
});

export const SocketContextProvider = observer((props: IProps) => {
    const localStore = useLocalObservable(() => ({
        socket: null
    }));

    const playerData = useContext(PlayerDataContext);

    const setSocket = action(() => {
        localStore.socket = io("http://localhost:3001");
    });

    React.useEffect(() => {
        if (playerData.name) {
            // For now, only try to connect to the socket after we have retrieved the player data
            // This ensures a session already exists on the server when we connect the socket,
            // Since the retrieve player data request will store a session if one doesn't already exist

            setSocket();
            return () => {
                localStore.socket.close();
            };
        }
    }, [playerData.name]);

    return (
        <SocketContext.Provider value={{ socket: localStore.socket }}>
            {props.children}
        </SocketContext.Provider>
    );
});
