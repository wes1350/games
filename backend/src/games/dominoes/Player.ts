import { Domino } from "./Domino";

export class Player {
    private _id: string;
    private _index: number;
    private _hand: Domino[];
    private _name: string;
    private _score: number;

    constructor(id: string, index: number, name: string) {
        this._id = id;
        this._index = index;
        this._hand = [];
        this._name = name;
        this._score = 0;
    }

    public AssignHand(hand: Domino[]) {
        this._hand = hand;
    }

    public AddDomino(domino: Domino) {
        this._hand.push(domino);
    }

    public RemoveDomino(domino: Domino) {
        const requestedDomino = this._hand.find((d) => d.Equals(domino));
        if (!requestedDomino) {
            throw new Error(`Could not find domino ${domino.Rep} in hand.`);
        } else {
            this._hand = this._hand.filter((d) => !d.Equals(domino));
            return requestedDomino;
        }
    }

    public AddPoints(points: number): void {
        this._score += points;
    }

    public get Id(): string {
        return this._id;
    }

    public get Index(): number {
        return this._index;
    }

    public get Name(): string {
        return this._name;
    }

    public get Score(): number {
        return this._score;
    }

    public get Hand(): Domino[] {
        return this._hand;
    }

    public get HandTotal(): number {
        return this._hand
            .map((domino) => domino.Total)
            .reduce((a, b) => a + b, 0);
    }

    public HandIsEmpty(): boolean {
        return this._hand.length === 0;
    }

    public get HandRep(): { Face1: number; Face2: number }[] {
        return this.Hand.map((domino) => ({
            Face1: domino.Big,
            Face2: domino.Small
        }));
    }
}
