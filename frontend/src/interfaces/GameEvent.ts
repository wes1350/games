import { GameEventType } from "enums/GameEventType";

export interface GameEvent {
    Id: number;
    Type: GameEventType;
    Duration: number;
    Seat?: number;
    Score?: number;
}
