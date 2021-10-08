import { Domino } from "./Domino";

export class Player {
    id: string;
    index: number;
    name: string;
    hand: Domino[];
    score: number;
}
