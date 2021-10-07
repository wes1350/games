import { expect } from "chai";
import { AddDomino } from "../BoardController";
import { InitializeBoard } from "../BoardUtils";
import { Direction } from "../enums/Direction";

describe("Board test", () => {
    it("should add dominoes to the board correctly when a double is first", () => {
        let board = InitializeBoard();
        expect(board.spinner).to.be.null;
        expect(board.initialRow).to.be.deep.eq([]);
        board = AddDomino(board, { head: 6, tail: 6 }, Direction.NONE);
        expect(board.spinner).to.be.deep.eq({ head: 6, tail: 6 });
        expect(board.initialRow).to.be.null;
        board = AddDomino(board, { head: 6, tail: 3 }, Direction.EAST);
        expect(board.spinner).to.be.deep.eq({ head: 6, tail: 6 });
        expect(board.westArm).to.be.deep.eq([]);
        expect(board.eastArm).to.be.deep.eq([{ head: 6, tail: 3 }]);
        expect(board.southArm).to.be.deep.eq([]);
        expect(board.northArm).to.be.deep.eq([]);
        expect(board.initialRow).to.be.null;
        board = AddDomino(board, { head: 3, tail: 3 }, Direction.EAST);
        expect(board.spinner).to.be.deep.eq({ head: 6, tail: 6 });
        expect(board.westArm).to.be.deep.eq([]);
        expect(board.eastArm).to.be.deep.eq([
            { head: 6, tail: 3 },
            { head: 3, tail: 3 }
        ]);
        expect(board.southArm).to.be.deep.eq([]);
        expect(board.northArm).to.be.deep.eq([]);
        expect(board.initialRow).to.be.null;
        board = AddDomino(board, { head: 6, tail: 2 }, Direction.WEST);
        expect(board.spinner).to.be.deep.eq({ head: 6, tail: 6 });
        expect(board.westArm).to.be.deep.eq([{ head: 6, tail: 2 }]);
        expect(board.eastArm).to.be.deep.eq([
            { head: 6, tail: 3 },
            { head: 3, tail: 3 }
        ]);
        expect(board.southArm).to.be.deep.eq([]);
        expect(board.northArm).to.be.deep.eq([]);
        expect(board.initialRow).to.be.null;
        board = AddDomino(board, { head: 6, tail: 0 }, Direction.NORTH);
        expect(board.spinner).to.be.deep.eq({ head: 6, tail: 6 });
        expect(board.westArm).to.be.deep.eq([{ head: 6, tail: 2 }]);
        expect(board.eastArm).to.be.deep.eq([
            { head: 6, tail: 3 },
            { head: 3, tail: 3 }
        ]);
        expect(board.southArm).to.be.deep.eq([]);
        expect(board.northArm).to.be.deep.eq([{ head: 6, tail: 0 }]);
        expect(board.initialRow).to.be.null;
        board = AddDomino(board, { head: 0, tail: 4 }, Direction.NORTH);
        expect(board.spinner).to.be.deep.eq({ head: 6, tail: 6 });
        expect(board.westArm).to.be.deep.eq([{ head: 6, tail: 2 }]);
        expect(board.eastArm).to.be.deep.eq([
            { head: 6, tail: 3 },
            { head: 3, tail: 3 }
        ]);
        expect(board.southArm).to.be.deep.eq([]);
        expect(board.northArm).to.be.deep.eq([
            { head: 6, tail: 0 },
            { head: 0, tail: 4 }
        ]);
        expect(board.initialRow).to.be.null;
        board = AddDomino(board, { head: 6, tail: 5 }, Direction.SOUTH);
        expect(board.spinner).to.be.deep.eq({ head: 6, tail: 6 });
        expect(board.westArm).to.be.deep.eq([{ head: 6, tail: 2 }]);
        expect(board.eastArm).to.be.deep.eq([
            { head: 6, tail: 3 },
            { head: 3, tail: 3 }
        ]);
        expect(board.southArm).to.be.deep.eq([{ head: 6, tail: 5 }]);
        expect(board.northArm).to.be.deep.eq([
            { head: 6, tail: 0 },
            { head: 0, tail: 4 }
        ]);
        expect(board.initialRow).to.be.null;
        board = AddDomino(board, { head: 5, tail: 1 }, Direction.SOUTH);
        expect(board.spinner).to.be.deep.eq({ head: 6, tail: 6 });
        expect(board.westArm).to.be.deep.eq([{ head: 6, tail: 2 }]);
        expect(board.eastArm).to.be.deep.eq([
            { head: 6, tail: 3 },
            { head: 3, tail: 3 }
        ]);
        expect(board.southArm).to.be.deep.eq([
            { head: 6, tail: 5 },
            { head: 5, tail: 1 }
        ]);
        expect(board.northArm).to.be.deep.eq([
            { head: 6, tail: 0 },
            { head: 0, tail: 4 }
        ]);
        expect(board.initialRow).to.be.null;
        board = AddDomino(board, { head: 2, tail: 3 }, Direction.WEST);
        expect(board.spinner).to.be.deep.eq({ head: 6, tail: 6 });
        expect(board.westArm).to.be.deep.eq([
            { head: 6, tail: 2 },
            { head: 2, tail: 3 }
        ]);
        expect(board.eastArm).to.be.deep.eq([
            { head: 6, tail: 3 },
            { head: 3, tail: 3 }
        ]);
        expect(board.southArm).to.be.deep.eq([
            { head: 6, tail: 5 },
            { head: 5, tail: 1 }
        ]);
        expect(board.northArm).to.be.deep.eq([
            { head: 6, tail: 0 },
            { head: 0, tail: 4 }
        ]);
        expect(board.initialRow).to.be.null;
    });

    it("should add dominoes to the board correctly when a non-double is first", () => {
        let board = InitializeBoard();
        expect(board.spinner).to.be.null;
        expect(board.initialRow).to.be.deep.eq([]);
        board = AddDomino(board, { head: 6, tail: 4 }, Direction.NONE);
        expect(board.spinner).to.be.null;
        expect(board.initialRow).to.be.deep.eq([{ head: 6, tail: 4 }]);

        board = AddDomino(board, { head: 6, tail: 3 }, Direction.WEST);
        expect(board.spinner).to.be.null;
        expect(board.westArm).to.deep.eq([]);
        expect(board.eastArm).to.deep.eq([]);
        expect(board.southArm).to.deep.eq([]);
        expect(board.northArm).to.deep.eq([]);
        expect(board.initialRow).to.be.deep.eq([
            { head: 3, tail: 6 },
            { head: 6, tail: 4 }
        ]);

        board = AddDomino(board, { head: 0, tail: 3 }, Direction.WEST);
        expect(board.spinner).to.eq(null);
        expect(board.westArm).to.deep.eq([]);
        expect(board.eastArm).to.deep.eq([]);
        expect(board.southArm).to.deep.eq([]);
        expect(board.northArm).to.deep.eq([]);
        expect(board.initialRow).to.be.deep.eq([
            { head: 0, tail: 3 },
            { head: 3, tail: 6 },
            { head: 6, tail: 4 }
        ]);

        board = AddDomino(board, { head: 0, tail: 0 }, Direction.WEST);
        expect(board.spinner).to.be.deep.eq({ head: 0, tail: 0 });
        expect(board.westArm).to.be.deep.eq([]);
        expect(board.eastArm).to.be.deep.eq([
            { head: 0, tail: 3 },
            { head: 3, tail: 6 },
            { head: 6, tail: 4 }
        ]);
        expect(board.southArm).to.be.deep.eq([]);
        expect(board.northArm).to.deep.eq([]);
        expect(board.initialRow).to.be.null;
    });
});
