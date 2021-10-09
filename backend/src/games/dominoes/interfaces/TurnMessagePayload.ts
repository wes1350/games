import { Direction } from "../enums/Direction";
import { Domino } from "../Domino";

export interface TurnMessagePayload {
    seat: number;
    domino: Domino;
    direction: Direction;
}
