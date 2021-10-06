import { Domino } from "./interfaces/Domino";

export class DominoViewModel {
    public static IsDouble(domino: Domino): boolean {
        return domino.head === domino.tail;
    }

    public static HasFace(domino: Domino, face: number): boolean {
        return domino.head === face || domino.tail === face;
    }

    public static Equals(first: Domino, second: Domino): boolean {
        return (
            (first.head === second.head && first.tail === second.tail) ||
            (first.head === second.tail && first.tail === second.head)
        );
    }

    public static Total(domino: Domino): number {
        return domino.head + domino.tail;
    }

    // Return the Tail for non-doubles and the regular Total for doubles.
    // NOTE: does not produce the correct result in the non-spinner case on the west side,
    // since the exposed end will be the Head.
    public static ExposedTotal(domino: Domino): number {
        if (!domino) {
            return 0;
        }
        return DominoViewModel.IsDouble(domino)
            ? DominoViewModel.Total(domino)
            : domino.tail;
    }

    public static TextRep(domino: Domino): string {
        return `[${domino.head},${domino.tail}]`;
    }

    // Used for dominoes in the south and west arms, since the head points towards the center
    public static ReversedTextRep(domino: Domino): string {
        return `[${domino.tail},${domino.head}]`;
    }
}
