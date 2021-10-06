import { Domino } from "./interfaces/Domino";

export class DominoController {
    public static Reverse(domino: Domino): Domino {
        return { head: domino.tail, tail: domino.head };
    }
}
