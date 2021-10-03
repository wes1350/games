import { Direction } from "enums/Direction";

export const isNullOrUndefined = (value: any) => {
    return value === null || value === undefined;
};

export const generateId = (): number => {
    return Math.floor(Math.random() * 10000000);
};

export const rotateDirectionClockwise = (direction: Direction) => {
    return direction === Direction.NORTH
        ? Direction.EAST
        : direction === Direction.EAST
        ? Direction.SOUTH
        : direction === Direction.SOUTH
        ? Direction.WEST
        : Direction.NORTH;
};
