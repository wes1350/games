import { DominoViewModel } from "viewmodel/DominoViewModel";
import { Instance, types } from "mobx-state-tree";

export const DominoModel = types.model({
    Face1: types.refinement(
        types.integer,
        (value) => value >= -1 && value <= 9
    ),
    Face2: types.refinement(types.integer, (value) => value >= -1 && value <= 9)
});

export type IDominoModel = Instance<typeof DominoModel>;

export const Domino = DominoModel.views(DominoViewModel).named("Domino");
export type IDomino = Instance<typeof Domino>;
