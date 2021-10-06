import { Domino } from "./Domino";

export interface Board {
    spinner: Domino | null;
    northArm: Domino[]; // The arms will be empty before there is a spinner and filled in after
    eastArm: Domino[];
    southArm: Domino[];
    westArm: Domino[];
    initialRow: Domino[] | null; // This will be filled in before there is a spinner and null after
}
