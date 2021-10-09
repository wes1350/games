import _ from "lodash";
import { Domino } from "./Domino";

export type Pack = Domino[];

export const InitializePack = (): Pack => {
    return _.flatten(
        _.range(7).map((i) => _.range(i + 1).map((j) => ({ head: i, tail: j })))
    );
};

export const Pull = (
    pack: Pack,
    n: number = 1
): { pulled: Domino[]; pack: Pack } => {
    const sampledIndices = _.sampleSize(_.range(Size(pack)), n);
    return {
        pack: pack.filter((domino, i) => !sampledIndices.includes(i)),
        pulled: pack.filter((domino, i) => sampledIndices.includes(i))
    };
};

export const Size = (pack: Pack): number => {
    return pack.length;
};
