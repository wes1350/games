import _ from "lodash";
import { Domino } from "./Domino";
import { Direction } from "./enums/Direction";

export class Board {
    private spinner: Domino | null;
    private northArm: Domino[]; // The arms will be empty before there is a spinner and filled in after
    private eastArm: Domino[];
    private southArm: Domino[];
    private westArm: Domino[];
    private initialRow: Domino[] | null; // This will be filled in before there is a spinner and null after

    constructor() {
        this.spinner = null;
        this.northArm = [];
        this.eastArm = [];
        this.southArm = [];
        this.westArm = [];
        this.initialRow = [];
    }

    public get NDominoes(): number {
        return this.spinner
            ? 1
            : 0 +
                  this.northArm.length +
                  this.eastArm.length +
                  this.westArm.length +
                  this.southArm.length +
                  this.initialRow?.length ?? 0;
    }

    public get Spinner(): Domino | null {
        return this.spinner;
    }

    private setSpinner(domino: Domino, addedDirection: Direction) {
        this.spinner = domino;

        // Assign the already-played dominoes to arms, and clear the initial row
        if (addedDirection === Direction.EAST) {
            this.westArm = this.initialRow;
            // In the initial row, the Head of each domino is on the left. As the spinner is on
            // the east now, the Heads should point towards the spinner, so we need to reverse them.
            // Also reverse their order, so that the last one is furthest from the center.
            this.westArm.forEach((domino) => domino.Reverse());
            this.westArm = _.reverse(this.westArm);
        } else if (addedDirection === Direction.WEST) {
            this.eastArm = this.initialRow;
        }

        this.initialRow = null;
    }

    private getArmByDirection(direction: Direction) {
        if (direction === Direction.NONE) {
            return null;
        } else if (direction === Direction.NORTH) {
            return this.northArm;
        } else if (direction === Direction.EAST) {
            return this.eastArm;
        } else if (direction === Direction.SOUTH) {
            return this.southArm;
        } else if (direction === Direction.WEST) {
            return this.westArm;
        }
    }

    public AddDomino(domino: Domino, direction: Direction): void {
        if (!this.VerifyPlacement(domino, direction)) {
            throw new Error(
                `Domino ${domino.Rep} cannot be added in the ${direction} direction`
            );
        }

        if (direction === Direction.NONE && this.NDominoes !== 0) {
            throw new Error(
                "Tried to add a domino without a direction when it was not the first domino"
            );
        }

        if (domino.IsDouble && !this.spinner) {
            this.setSpinner(domino, direction);
        } else {
            if (!this.spinner) {
                if (direction === Direction.NONE) {
                    this.initialRow.push(domino);
                } else if (direction === Direction.EAST) {
                    const end = _.last(this.initialRow);
                    this.initialRow.push(domino);
                    if (end.Tail !== domino.Head) {
                        domino.Reverse();
                    }
                } else if (direction === Direction.WEST) {
                    const end = _.first(this.initialRow);
                    this.initialRow.unshift(domino);
                    if (end.Head !== domino.Tail) {
                        domino.Reverse();
                    }
                } else {
                    throw new Error(
                        `Invalid direction encountered when no spinner was set: ${direction}`
                    );
                }
            } else {
                const arm = this.getArmByDirection(direction);
                const end = _.last(arm) ?? this.spinner;
                arm.push(domino);
                if (end.Tail !== domino.Head) {
                    domino.Reverse();
                }
            }
        }
    }

    public VerifyPlacement(domino: Domino, direction: Direction): boolean {
        // Return whether a domino can be placed in the given direction
        if (direction === Direction.NONE) {
            return this.NDominoes === 0;
        } else {
            if (this.NDominoes === 0) {
                return false;
            }

            if (this.spinner) {
                if (
                    direction === Direction.NORTH ||
                    direction === Direction.SOUTH
                ) {
                    if (
                        this.eastArm.length === 0 ||
                        this.westArm.length === 0
                    ) {
                        return false;
                    }
                }
                const arm = this.getArmByDirection(direction);
                const end = _.last(arm) ?? this.spinner;
                return domino.HasFace(end.Tail);
            } else {
                if (direction === Direction.EAST) {
                    return domino.HasFace(_.first(this.initialRow).Head);
                } else if (direction === Direction.WEST) {
                    return domino.HasFace(_.last(this.initialRow).Tail);
                } else {
                    return false;
                }
            }
        }
    }

    public GetValidPlacements(domino: Domino): Direction[] {
        // Return which directions a domino can be placed in.
        if (this.IsEmpty()) {
            return [Direction.NONE];
        }
        return Object.values(Direction).filter((d) =>
            this.VerifyPlacement(domino, d)
        );
    }

    public GetValidPlacementsForHand(
        hand: Domino[],
        playFresh = false
    ): { index: number; domino: Domino; dirs: Direction[] }[] {
        const placements: {
            index: number;
            domino: Domino;
            dirs: Direction[];
        }[] = [];
        let largestDouble = -1;
        if (playFresh) {
            hand.forEach((domino: Domino) => {
                if (domino.IsDouble && domino.Big > largestDouble) {
                    largestDouble = domino.Big;
                }
            });
        }
        hand.forEach((domino, i) => {
            if (playFresh) {
                if (domino.Head !== largestDouble || !domino.IsDouble) {
                    placements.push({ index: i, domino, dirs: [] });
                } else {
                    placements.push({
                        index: i,
                        domino,
                        dirs: this.GetValidPlacements(domino)
                    });
                }
            } else {
                placements.push({
                    index: i,
                    domino,
                    dirs: this.GetValidPlacements(domino)
                });
            }
        });
        return placements;
    }
    public IsEmpty(): boolean {
        return this.NDominoes === 0;
    }

    public get Score(): number {
        if (this.IsEmpty()) {
            throw new Error("Cannot score an empty board");
        }

        let total = 0;
        if (this.spinner) {
            if (this.eastArm.length === 0 && this.westArm.length === 0) {
                total += this.spinner.Total;
            } else if (this.eastArm.length === 0) {
                total += _.last(this.westArm).ExposedTotal + this.spinner.Total;
            } else if (this.westArm.length === 0) {
                total += _.last(this.eastArm).ExposedTotal + this.spinner.Total;
            } else {
                total += _.last(this.westArm).ExposedTotal;
                total += _.last(this.eastArm).ExposedTotal;
                total += _.last(this.northArm)?.ExposedTotal ?? 0;
                total += _.last(this.southArm)?.ExposedTotal ?? 0;
            }
        } else {
            total +=
                _.first(this.initialRow).Head + _.last(this.initialRow).Tail;
        }

        return total % 5 === 0 ? total : 0;
    }

    public get Rep(): string {
        // Returns a textual representation of the current board state.

        let rep = "";
        const blank = "     ";

        if (this.spinner) {
            // top
            for (let i = this.northArm.length - 1; i >= 0; i--) {
                for (let i = 0; i < this.westArm.length; i++) {
                    rep += blank;
                }

                rep += this.northArm[i].Rep + "\n";
            }

            // middle row
            for (let i = this.westArm.length - 1; i >= 0; i--) {
                rep += this.westArm[i].ReversedRep;
            }

            rep += this.spinner.Rep;

            for (let i = 0; i < this.eastArm.length; i++) {
                rep += this.eastArm[i].Rep;
            }

            rep += "\n";

            // bottom
            for (let i = 0; i < this.southArm.length; i++) {
                for (let i = 0; i < this.westArm.length; i++) {
                    rep += blank;
                }

                rep += this.southArm[i].ReversedRep + "\n";
            }

            return rep;
        } else {
            return this.initialRow.map((domino) => domino.Rep).join("");
        }
    }

    // public get Dominoes(): Domino[] {
    //     return _.flatten(
    //         Array.from(this._board.values()).map((yMap) =>
    //             Array.from(yMap.values())
    //         )
    //     );
    // }

    // public get DominoRepresentations(): {
    //     head: number;
    //     tail: number;
    //     x: number;
    //     y: number;
    // }[] {
    //     return _.flatten(
    //         Array.from(this._board.entries()).map((xEntry) => {
    //             const x = xEntry[0];
    //             const xMap = xEntry[1];
    //             return Array.from(xMap.entries()).map((yEntry) => {
    //                 const y = yEntry[0];
    //                 const domino = yEntry[1];
    //                 return { head: domino.Head, tail: domino.Tail, x, y };
    //             });
    //         })
    //     );
    // }
}
