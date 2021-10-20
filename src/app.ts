import express from "express";
import * as http from "http";
import cors from "cors";
import { Socket } from "socket.io";
import { Room } from "./Room";
import redis from "redis";
import session, { SessionOptions } from "express-session";
import connectRedis from "connect-redis";
import { RoomMessageType } from "games-common/src/enums/RoomMessageType";
import { GameMessageType } from "games-common/src/games/dominoes/enums/GameMessageType";
import _ from "lodash";

declare module "express-session" {
    interface SessionData {
        playerName: string;
    }
}

const redisClient = redis.createClient();
const RedisStore = connectRedis(session);
const redisStoreInstance = new RedisStore({ client: redisClient });

const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true
    // optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const devTestSecret = "dev-test-secret";

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

const sessionOptions: SessionOptions = {
    cookie: {
        // domain: ".app.localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        maxAge: null
    },
    store: redisStoreInstance,
    saveUninitialized: false,
    secret: devTestSecret,
    resave: false
};

const sessionMiddleware = session(sessionOptions);

app.use(sessionMiddleware);

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        transports: ["websocket", "polling"],
        credentials: true
    },
    allowEIO3: true
});

// From https://socket.io/docs/v4/middlewares/
const wrap =
    (middleware: any) => (socket: Socket, next: express.NextFunction) =>
        middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));

// Is this necessary? Maybe store in the session as a property
// Map each session ID to all connected socket IDs (e.g. if there are multiple tabs)
const sessionIdsToSocketIds = new Map<string, string[]>();

const addSocketIdToSession = (sessionId: string, socketId: string) => {
    if (!sessionIdsToSocketIds.has(sessionId)) {
        sessionIdsToSocketIds.set(sessionId, [socketId]);
    } else {
        sessionIdsToSocketIds.get(sessionId).push(socketId);
    }
};

const removeSocketIdFromSession = (sessionId: string, socketId: string) => {
    if (sessionIdsToSocketIds.has(sessionId)) {
        if (sessionIdsToSocketIds.get(sessionId).length === 1) {
            sessionIdsToSocketIds.delete(sessionId);
        } else {
            sessionIdsToSocketIds.set(
                sessionId,
                sessionIdsToSocketIds
                    .get(sessionId)
                    .filter((id) => id !== socketId)
            );
        }
    }
};

// Move this to Redis later
const roomIdsToRooms = new Map<string, Room>();
const socketIdsToRoomIds = new Map<string, string[]>();

io.on("connection", (socket: Socket) => {
    const session = (socket.request as any).session;
    const sessionId = session.id;

    console.log(`a user with session ID ${sessionId} connected`);
    addSocketIdToSession(sessionId, socket.id);
    socketIdsToRoomIds.set(socket.id, []);

    socket.on("disconnect", () => {
        console.log(`user with session ID ${sessionId} disconnected`);
        removeSocketIdFromSession(sessionId, socket.id);

        socketIdsToRoomIds.get(socket.id).forEach((roomId) => {
            const room = roomIdsToRooms.get(roomId);
            if (room) {
                console.log(`user disconnected, removing from room ${roomId}`);
                room.RemovePlayerBySocketId(socket.id);
                // Replace with a user ID or something here
                if (room.NPlayers > 0) {
                    io.to(roomId).emit(RoomMessageType.PLAYER_LEFT_ROOM, null);
                } else {
                    roomIdsToRooms.delete(roomId);
                }
            }
        });
    });

    socket.on(
        GameMessageType.GAME_START,
        // TODO: add type for config
        (roomId: string, config: any) => {
            console.log(`starting game for room ${roomId}`);
            roomIdsToRooms.get(roomId).StartGame(config);
        }
    );

    socket.on(RoomMessageType.JOIN_ROOM, (roomId: string) => {
        console.log("socket session ID:", (socket.request as any).session.id);
        redisStoreInstance.get(
            (socket.request as any).session.id,
            (error, session) => {
                if (error) {
                    console.error(error);
                    return;
                }

                console.log(
                    `user ${session.playerName} joining room ${roomId}`
                );
                if (!roomIdsToRooms.get(roomId)) {
                    roomIdsToRooms.set(roomId, new Room(roomId, io));
                }
                if (!socketIdsToRoomIds.get(socket.id).includes(roomId)) {
                    socketIdsToRoomIds.get(socket.id).push(roomId);
                }
                socket.join(roomId);
                const room = roomIdsToRooms.get(roomId);
                room.AddPlayer(socket.id, session.playerName);
                io.to(roomId).emit(
                    RoomMessageType.ROOM_DETAILS,
                    room.PlayerDetails
                );
                // Replace with user ID or something similar
                socket
                    .to(roomId)
                    .emit(RoomMessageType.PLAYER_JOINED_ROOM, "user");
            }
        );
    });

    socket.on(RoomMessageType.LEAVE_ROOM, (roomId: string) => {
        console.log(`user leaving room ${roomId}`);
        const room = roomIdsToRooms.get(roomId);
        if (!room) {
            console.warn("warning: tried to leave a room that did not exist");
        }
        room?.RemovePlayerBySocketId(socket.id);
        const roomIdsForSocket = socketIdsToRoomIds.get(socket.id);
        const roomIdIndex = roomIdsForSocket.findIndex(
            (value: string) => value === roomId
        );
        socketIdsToRoomIds.set(
            socket.id,
            roomIdsForSocket.splice(roomIdIndex, 1)
        );
        socket.leave(roomId);
        // Replace with user ID or something similar
        if (room?.NPlayers > 0) {
            io.to(roomId).emit(
                RoomMessageType.ROOM_DETAILS,
                room.PlayerDetails
            );
            socket.to(roomId).emit(RoomMessageType.PLAYER_LEFT_ROOM, "user");
        } else {
            roomIdsToRooms.delete(roomId);
        }
    });
});

app.get(
    "/getName",
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        if (req.session.playerName) {
            res.send({ name: req.session.playerName });
        } else {
            const guestName = `Guest-${_.random(0, 10000000)}`;
            req.session.playerName = guestName;
            res.send({ name: guestName });
        }
    }
);

app.post(
    "/setName",
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const name = req.body.name;
        if (name) {
            req.session.playerName = name;
            console.log("user changed name to:", name);
            res.send(true);
        } else {
            console.log("name was empty, not changing");
            res.send(false);
        }
    }
);

app.get(
    "/rooms",
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const roomIds = Array.from(roomIdsToRooms.keys());
        const roomDetails = roomIds.map((roomId) => ({
            id: roomId,
            nPlayers: roomIdsToRooms.get(roomId).NPlayers
        }));
        res.json({ rooms: roomDetails });
    }
);

app.post(
    "/createRoom",
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        console.log("got a request to /createRoom");
        const roomIds = Array.from(roomIdsToRooms.keys());
        while (true) {
            const roomId = _.random(0, 100000000).toString();
            if (!roomIds.includes(roomId)) {
                roomIdsToRooms.set(roomId, new Room(roomId, io));
                res.send(roomId);
                break;
            }
        }
    }
);

const port = 3001;
server.listen(port, () => {
    console.log(`listening on *:${port}`);
});
