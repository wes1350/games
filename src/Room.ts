import { GameConfig } from "@games-common/interfaces/GameConfig";
import { PlayerDetails } from "@games-common/interfaces/PlayerDetails";
import { Socket } from "socket.io";
import { GameManager } from "./GameManager";

export class Room {
    // Eventually, all of this state should be moved into Redis
    private io: any;
    private id: string;
    private socketIdsToNames: Map<string, string>;

    constructor(id: string, io: any) {
        this.io = io;
        this.id = id;
        this.socketIdsToNames = new Map<string, string>();
    }

    private get socketIds(): string[] {
        return Array.from(this.socketIdsToNames.keys());
    }

    private getSocketFromId(socketId: string): Socket {
        return this.io.sockets.sockets.get(socketId) as Socket;
    }

    public get PlayerDetails(): PlayerDetails[] {
        return Array.from(this.socketIdsToNames.entries()).map((entry) => ({
            id: entry[0],
            name: entry[1]
        }));
    }

    public get NPlayers(): number {
        return this.socketIds.length;
    }

    public AddPlayer(socketId: string, playerName: string): void {
        console.log(
            `adding socket with ID ${socketId} and name ${playerName} to room ${this.id}`
        );

        this.socketIdsToNames.set(socketId, playerName);
    }

    public RemovePlayerBySocketId(socketId: string): void {
        this.socketIdsToNames.delete(socketId);
    }

    public StartGame(config: GameConfig): void {
        console.log("config:", config);
        GameManager.RunGame(
            config,
            this.PlayerDetails,
            this.broadcast.bind(this),
            this.emitToPlayer.bind(this),
            this.queryPlayer.bind(this)
        ).then(() => this.clear());
    }

    private clear = () => {
        // Problem: we are clearing (since the game is over) before the messages get sent, resulting in the game over message not being received
        // Might want to rethink the architecture - kicking people out of rooms once the game is over may not be ideal
        console.log("clearing");
        this.socketIds.forEach((socketId) => {
            this.RemovePlayerBySocketId(socketId);
            this.io.sockets.sockets.get(socketId).leave(this.id);
        });
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
        this.getSocketFromId(playerId).emit(type as string, payload);
        return new Promise((resolve) => {
            this.getSocketFromId(playerId).once(type as string, (response) => {
                console.log("response:", response);
                resolve(response);
            });
        });
    };
}
