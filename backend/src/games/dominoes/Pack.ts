import _ from "lodash";
import { Domino } from "./Domino";

export class Pack {
    private _dominoes: Domino[];

    constructor(max_pips = 6) {
        this._dominoes = [];
        for (let i = 0; i < max_pips + 1; i++) {
            for (let j = 0; j <= i; j++) {
                this._dominoes.push(new Domino(i, j));
            }
        }
    }

    public Pull(n = 1): Domino[] | null {
        if (n === 1) {
            if (this._dominoes.length === 0) {
                return null;
            }
            return this._dominoes.splice(
                _.random(this._dominoes.length - 1),
                1
            );
        } else {
            const pulled = [];
            for (let i = 0; i < n; i++) {
                pulled.push(
                    this._dominoes.splice(
                        _.random(this._dominoes.length - 1),
                        1
                    )[0]
                );
            }
            return pulled;
        }
    }
}
