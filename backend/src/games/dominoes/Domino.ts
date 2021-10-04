export class Domino {
    private big: number;
    private small: number;
    private reversed: boolean; // for indicating direction on the board

    constructor(big: number, small: number) {
        if (big < small) {
            throw new Error("Must pass in big end of Domino first");
        }
        this.big = big;
        this.small = small;
        this.reversed = false;
    }

    public get Big(): number {
        return this.big;
    }

    public get Small(): number {
        return this.small;
    }

    public get IsDouble(): boolean {
        return this.Big === this.Small;
    }

    public Reverse(): void {
        this.reversed = !this.reversed;
    }

    public HasFace(face: number): boolean {
        return this.Big === face || this.Small === face;
    }

    public get IsReversed() {
        return this.reversed;
    }

    public get Head(): number {
        return this.reversed ? this.Small : this.Big;
    }

    public get Tail(): number {
        return this.reversed ? this.Big : this.Small;
    }

    public get Total(): number {
        return this.Big + this.Small;
    }

    // Return the Tail for non-doubles and the regular Total for doubles.
    // NOTE: does not produce the correct result in the non-spinner case on the west side,
    // since the exposed end will be the Head.
    public get ExposedTotal(): number {
        return this.IsDouble ? this.Total : this.Tail;
    }

    public Equals(domino: Domino) {
        return this.Big === domino.Big && this.Small === domino.Small;
    }

    public get Rep(): string {
        return this.reversed
            ? `[${this.Small},${this.Big}]`
            : `[${this.Big},${this.Small}]`;
    }

    // Used for dominoes in the south and west arms, since the head points towards the center
    public get ReversedRep(): string {
        return !this.reversed
            ? `[${this.Small},${this.Big}]`
            : `[${this.Big},${this.Small}]`;
    }
}
