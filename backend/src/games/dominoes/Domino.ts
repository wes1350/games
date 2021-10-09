export interface Domino {
    head: number;
    tail: number;
}

export const IsDouble = (domino: Domino): boolean => {
    return domino.head === domino.tail;
};

export const HasFace = (domino: Domino, face: number): boolean => {
    return domino.head === face || domino.tail === face;
};

export const Equals = (first: Domino, second: Domino): boolean => {
    return (
        (first.head === second.head && first.tail === second.tail) ||
        (first.head === second.tail && first.tail === second.head)
    );
};

export const Total = (domino: Domino): number => {
    return domino.head + domino.tail;
};

// Return the Tail for non-doubles and the regular Total for doubles.
// NOTE: does not produce the correct result in the non-spinner case on the west side,
// since the exposed end will be the Head.
export const ExposedTotal = (domino: Domino): number => {
    if (!domino) {
        return 0;
    }
    return IsDouble(domino) ? Total(domino) : domino.tail;
};

export const DominoTextRep = (domino: Domino): string => {
    return `[${domino.head},${domino.tail}]`;
};

// Used for dominoes in the south and west arms, since the head points towards the center
export const ReversedDominoTextRep = (domino: Domino): string => {
    return `[${domino.tail},${domino.head}]`;
};

export const Reversed = (domino: Domino): Domino => {
    return { head: domino.tail, tail: domino.head };
};
