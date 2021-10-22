import { GameConfig } from "@games-common/interfaces/GameConfig";
import { PlayerDetails } from "@games-common/interfaces/PlayerDetails";
import { Socket } from "socket.io";
import { GameManager } from "./GameManager";

const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export class Room {
    // Eventually, all of this state should be moved into Redis
    private io: any;
    private id: string;
    private socketIdsToResponses: Map<string, string>;
    private socketIdsToNames: Map<string, string>;
    // private playersToSocketIds: Map<number, string>;

    constructor(id: string, io: any) {
        this.io = io;
        this.id = id;
        this.socketIdsToResponses = new Map<string, string>();
        this.socketIdsToNames = new Map<string, string>();
        // this.playersToSocketIds = new Map<number, string>();
    }

    // private get players(): number[] {
    //     return Array.from(this.playersToSocketIds.keys());
    // }

    private get socketIds(): string[] {
        return Array.from(this.socketIdsToResponses.keys());
    }

    private getSocketFromId(socketId: string): Socket {
        return this.io.sockets.sockets.get(socketId) as Socket;
    }

    public get PlayerDetails(): PlayerDetails[] {
        return Array.from(this.socketIdsToNames.entries()).map((entry) => ({
            id: entry[0],
            name: entry[1]
        }));
        // return Array.from(this.socketIdsToNames.values()).map((name) => ({
        //     name: name
        // }));
    }

    public get NPlayers(): number {
        return this.socketIds.length;
    }

    public AddPlayer(socketId: string, playerName: string): void {
        console.log(
            `adding socket with ID ${socketId} and name ${playerName} to room ${this.id}`
        );
        if (!this.socketIdsToResponses.has(socketId)) {
            this.socketIdsToResponses.set(socketId, null);
        } else {
            console.warn(
                `Tried to add socket id ${socketId} to room ${this.id} when it already existed in the room`
            );
        }

        this.socketIdsToNames.set(socketId, playerName);
    }

    public RemovePlayerBySocketId(socketId: string): void {
        // this.sockets = this.sockets.filter((socket) => socket.id !== id);
        this.socketIdsToResponses.delete(socketId);
        this.socketIdsToNames.delete(socketId);
    }

    public StartGame(config: GameConfig): void {
        console.log("config:", config);
        this.socketIds.forEach((socketId: string) => {
            // this.playersToSocketIds.set(i, socketId);
            this.socketIdsToResponses.set(socketId, null);

            // should register socket.once(event, ... ) instead of doing this while-loop check for responses
            this.getSocketFromId(socketId).onAny(
                (eventName: string, response: string) => {
                    console.log(
                        `received: ${eventName} -- response: ${
                            typeof response === "object"
                                ? JSON.stringify(response)
                                : response
                        }`
                    );
                    this.socketIdsToResponses.set(socketId, response);
                }
            );
        });

        GameManager.RunGame(
            config,
            this.PlayerDetails,
            this.broadcast.bind(this),
            this.emitToPlayer.bind(this),
            this.queryPlayer.bind(this)
        ).then(() => this.clear());

        // const engine = new Engine(
        //     this.socketIds.length,
        //     config,
        //     this.emitToPlayer.bind(this),
        //     this.broadcast.bind(this),
        //     this.queryPlayer.bind(this)
        // );

        // engine.InitializeRound(true);

        // this.players.forEach((player: number) => {
        //     const gameDetails = {
        //         players: this.getPlayerRepresentationsForSeat(player),
        //         config: {
        //             n_dominoes: config.HandSize
        //         }
        //     };
        //     const socket = this.getSocketFromId(
        //         this.playersToSocketIds.get(player)
        //     );
        //     socket.emit(MessageType.GAME_START, gameDetails);
        //     socket.emit(MessageType.HAND, engine.Players[player].HandRep);
        // });

        // engine.RunGame().then((winner) => {
        //     console.log("Winner:", winner);
        //     this.broadcast(MessageType.GAME_OVER, this.getNameBySeat(winner));
        //     this.clear();
        // });
    }

    private clear = () => {
        this.socketIds.forEach((socketId) => {
            this.RemovePlayerBySocketId(socketId);
            this.io.sockets.sockets.get(socketId).leave(this.id);
        });
        // this.playersToSocketIds = new Map();
    };

    private broadcast(type: any, payload: any) {
        console.log(
            `\nbroadcasting ${
                typeof payload === "object" ? JSON.stringify(payload) : payload
            } of type ${type} to room ${this.id}`
        );
        this.io.to(this.id).emit(type, payload);
    }

    private emitToPlayer = (type: any, payload: any, playerId: string) => {
        console.log(
            `\nemitting ${
                typeof payload === "object" ? JSON.stringify(payload) : payload
            } of type ${type} to player ${playerId}`
        );
        this.getSocketFromId(playerId).emit(type as string, payload);
    };

    private queryPlayer = async (
        type: any,
        payload: any,
        playerId: string
        // options: any,
        // gameState: GameState
    ): Promise<any> => {
        // if (!this.socketIdsToResponses.has(socketId)) {
        //     // User disconnected, so their socket ID response key was removed
        //     return null;
        // }
        this.socketIdsToResponses.delete(playerId);
        this.getSocketFromId(playerId).emit(type as string, payload);

        while (!this.socketIdsToResponses.get(playerId)) {
            await sleep(100);
        }

        if (!this.socketIdsToResponses.has(playerId)) {
            // User disconnected, so their socket ID response key was removed
            return null;
        }

        // try to use socket.once() here instead of this

        console.log("response:", this.socketIdsToResponses.get(playerId));
        return this.socketIdsToResponses.get(playerId);
    };
}
