import { GameConfig } from "@games-common/interfaces/GameConfig";
import { PlayerDetails } from "@games-common/interfaces/PlayerDetails";
import { ALPHANUMERIC_NONVOWEL, GenerateId } from "@games-common/utils";
import { Socket } from "socket.io";
import { GameManager } from "./GameManager";

enum MemberType {
    LOBBY = "LOBBY",
    PLAYER = "PLAYER",
    SPECTATOR = "SPECTATOR"
}

interface Member {
    name: string;
    type: MemberType;
}

const changeType = (member: Member, type: MemberType) => {
    return { ...member, type };
};

export class Room {
    // Eventually, all of this state should be moved into Redis
    private io: any;
    private id: string;
    private gameRoomId: string;
    private spectateRoomId: string;
    // maps socket id to member
    private members: Map<string, Member>;

    constructor(id: string, io: any) {
        this.io = io;
        this.id = id;
        this.members = new Map();
    }

    private get socketIds(): string[] {
        return Array.from(this.members.keys());
    }

    private getSocket(socketId: string): Socket {
        return this.io.sockets.sockets.get(socketId) as Socket;
    }

    public get LobbyMemberDetails(): PlayerDetails[] {
        return this.GetMemberDetails(MemberType.LOBBY);
    }

    private getMembersByType(type: MemberType): Map<string, Member> {
        return new Map(
            [...this.members].filter(([_key, member]) => member.type === type)
        );
    }

    public GetMemberDetails(type: MemberType): PlayerDetails[] {
        return [...this.getMembersByType(type)].map((entry) => ({
            id: entry[0],
            name: entry[1].name
        }));
    }

    public get NPlayers(): number {
        return this.socketIds.length;
    }

    public AddPlayerToLobby(socketId: string, playerName: string): void {
        console.log(
            `adding socket with ID ${socketId} and name ${playerName} to room lobby ${this.id}`
        );

        this.getSocket(socketId).join(this.id);
        this.members.set(socketId, {
            name: playerName,
            type: MemberType.LOBBY
        });
    }

    public MovePlayerFromLobbyToGameRoom(socketId: string): void {
        console.log(
            `moving player with socketId ${socketId} from lobby to game room in room ${this.id}`
        );

        this.getSocket(socketId).join(this.gameRoomId);
        this.members.set(
            socketId,
            changeType(this.members.get(socketId), MemberType.PLAYER)
        );
        this.getSocket(socketId).leave(this.id);
    }

    public MovePlayerFromGameRoomToLobby(socketId: string): void {
        console.log(
            `moving player with socketId ${socketId} from game room to lobby in room ${this.id}`
        );

        this.getSocket(socketId).join(this.id);
        this.members.set(
            socketId,
            changeType(this.members.get(socketId), MemberType.LOBBY)
        );

        this.getSocket(socketId).leave(this.gameRoomId);
    }

    public RemovePlayerBySocketId(socketId: string): void {
        if (this.getSocket(socketId)) {
            this.getSocket(socketId).leave(this.id);
            this.getSocket(socketId).leave(this.gameRoomId);
            this.getSocket(socketId).leave(this.spectateRoomId);
            this.members.delete(socketId);
        }
    }

    public StartGame(config: GameConfig): void {
        console.log("config:", config);

        const randomId = GenerateId(ALPHANUMERIC_NONVOWEL, 16);
        // TODO: Should clear out previous game/spectator rooms to avoid unused rooms building up
        // Not immediately though, since people may still want to chat post-game
        this.gameRoomId = `${this.id}_game_${randomId}`;
        this.spectateRoomId = `${this.id}_spectate_${randomId}`;

        [...this.getMembersByType(MemberType.LOBBY)].forEach(
            ([socketId, member]) => {
                this.MovePlayerFromLobbyToGameRoom(socketId);
            }
        );

        GameManager.RunGame(
            config,
            this.GetMemberDetails(MemberType.PLAYER),
            this.broadcastToPlayers.bind(this),
            this.emitToPlayer.bind(this),
            this.queryPlayer.bind(this)
        );
    }

    private broadcastToLobby(type: any, payload: any) {
        console.log(
            `\nbroadcasting ${
                typeof payload === "object" ? JSON.stringify(payload) : payload
            } of type ${type} to everyone in room lobby ${this.gameRoomId}`
        );
        this.io.to(this.id).emit(type, payload);
    }

    private broadcastToPlayers(type: any, payload: any) {
        console.log(
            `\nbroadcasting ${
                typeof payload === "object" ? JSON.stringify(payload) : payload
            } of type ${type} to players in room ${this.gameRoomId}`
        );
        this.io.to(this.gameRoomId).emit(type, payload);
    }

    // Spectating is not yet implemented, but to implement, a "broadcast to spectators" method needs to be added
    // This will be useful in cases where we emit unique messages to each player in game, but need to broadcast to spectators
    private broadcastToSpectators(type: any, payload: any) {
        console.log(
            `\nbroadcasting ${
                typeof payload === "object" ? JSON.stringify(payload) : payload
            } of type ${type} to spectators in room ${this.spectateRoomId}`
        );
        this.io.to(this.spectateRoomId).emit(type, payload);
    }

    private emitToPlayer = (type: any, payload: any, playerId: string) => {
        console.log(
            `\nemitting ${
                typeof payload === "object" ? JSON.stringify(payload) : payload
            } of type ${type} to player ${playerId}`
        );
        this.getSocket(playerId).emit(type as string, payload);
    };

    private queryPlayer = async (
        type: any,
        payload: any,
        playerId: string
        // options: any,
        // gameState: GameState
    ): Promise<any> => {
        this.getSocket(playerId).emit(type as string, payload);
        return new Promise((resolve) => {
            this.getSocket(playerId).once(type as string, (response) => {
                console.log("response:", response);
                resolve(response);
            });
        });
    };
}
