import { expect } from "chai";
import {
    AddDominoToBoard,
    InitializeBoard,
    ScoreBoard,
    VerifyPlacement
} from "../Board";
import { Direction } from "../enums/Direction";

describe("Board test", () => {
    it("should add dominoes to the board correctly when a double is first", () => {
        let board = InitializeBoard();
        expect(board.spinner).to.be.null;
        expect(board.initialRow).to.be.deep.eq([]);
        board = AddDominoToBoard(board, { head: 6, tail: 6 }, Direction.NONE);
        expect(board.spinner).to.be.deep.eq({ head: 6, tail: 6 });
        expect(board.initialRow).to.be.null;
        board = AddDominoToBoard(board, { head: 6, tail: 3 }, Direction.EAST);
        expect(board.spinner).to.be.deep.eq({ head: 6, tail: 6 });
        expect(board.westArm).to.be.deep.eq([]);
        expect(board.eastArm).to.be.deep.eq([{ head: 6, tail: 3 }]);
        expect(board.southArm).to.be.deep.eq([]);
        expect(board.northArm).to.be.deep.eq([]);
        expect(board.initialRow).to.be.null;
        board = AddDominoToBoard(board, { head: 3, tail: 3 }, Direction.EAST);
        expect(board.spinner).to.be.deep.eq({ head: 6, tail: 6 });
        expect(board.westArm).to.be.deep.eq([]);
        expect(board.eastArm).to.be.deep.eq([
            { head: 6, tail: 3 },
            { head: 3, tail: 3 }
        ]);
        expect(board.southArm).to.be.deep.eq([]);
        expect(board.northArm).to.be.deep.eq([]);
        expect(board.initialRow).to.be.null;
        board = AddDominoToBoard(board, { head: 6, tail: 2 }, Direction.WEST);
        expect(board.spinner).to.be.deep.eq({ head: 6, tail: 6 });
        expect(board.westArm).to.be.deep.eq([{ head: 6, tail: 2 }]);
        expect(board.eastArm).to.be.deep.eq([
            { head: 6, tail: 3 },
            { head: 3, tail: 3 }
        ]);
        expect(board.southArm).to.be.deep.eq([]);
        expect(board.northArm).to.be.deep.eq([]);
        expect(board.initialRow).to.be.null;
        board = AddDominoToBoard(board, { head: 6, tail: 0 }, Direction.NORTH);
        expect(board.spinner).to.be.deep.eq({ head: 6, tail: 6 });
        expect(board.westArm).to.be.deep.eq([{ head: 6, tail: 2 }]);
        expect(board.eastArm).to.be.deep.eq([
            { head: 6, tail: 3 },
            { head: 3, tail: 3 }
        ]);
        expect(board.southArm).to.be.deep.eq([]);
        expect(board.northArm).to.be.deep.eq([{ head: 6, tail: 0 }]);
        expect(board.initialRow).to.be.null;
        board = AddDominoToBoard(board, { head: 0, tail: 4 }, Direction.NORTH);
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
        board = AddDominoToBoard(board, { head: 6, tail: 5 }, Direction.SOUTH);
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
        board = AddDominoToBoard(board, { head: 5, tail: 1 }, Direction.SOUTH);
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
        board = AddDominoToBoard(board, { head: 2, tail: 3 }, Direction.WEST);
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
        board = AddDominoToBoard(board, { head: 6, tail: 4 }, Direction.NONE);
        expect(board.spinner).to.be.null;
        expect(board.initialRow).to.be.deep.eq([{ head: 6, tail: 4 }]);

        board = AddDominoToBoard(board, { head: 6, tail: 3 }, Direction.WEST);
        expect(board.spinner).to.be.null;
        expect(board.westArm).to.deep.eq([]);
        expect(board.eastArm).to.deep.eq([]);
        expect(board.southArm).to.deep.eq([]);
        expect(board.northArm).to.deep.eq([]);
        expect(board.initialRow).to.be.deep.eq([
            { head: 3, tail: 6 },
            { head: 6, tail: 4 }
        ]);

        board = AddDominoToBoard(board, { head: 0, tail: 3 }, Direction.WEST);
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

        board = AddDominoToBoard(board, { head: 0, tail: 0 }, Direction.WEST);
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

    it("should correctly score boards starting with spinner", () => {
        let board = InitializeBoard();
        board = AddDominoToBoard(board, { head: 6, tail: 6 }, Direction.NONE);
        expect(ScoreBoard(board)).to.eq(0);
        board = AddDominoToBoard(board, { head: 6, tail: 3 }, Direction.EAST);
        expect(ScoreBoard(board)).to.eq(15);
        board = AddDominoToBoard(board, { head: 6, tail: 2 }, Direction.WEST);
        expect(ScoreBoard(board)).to.eq(5);
        board = AddDominoToBoard(board, { head: 6, tail: 5 }, Direction.NORTH);
        expect(ScoreBoard(board)).to.eq(10);
        board = AddDominoToBoard(board, { head: 5, tail: 5 }, Direction.NORTH);
        expect(ScoreBoard(board)).to.eq(15);
        board = AddDominoToBoard(board, { head: 3, tail: 3 }, Direction.EAST);
        expect(ScoreBoard(board)).to.eq(0);
        board = AddDominoToBoard(board, { head: 2, tail: 2 }, Direction.WEST);
        expect(ScoreBoard(board)).to.eq(20);
        board = AddDominoToBoard(board, { head: 2, tail: 4 }, Direction.WEST);
        expect(ScoreBoard(board)).to.eq(20);
        board = AddDominoToBoard(board, { head: 6, tail: 1 }, Direction.SOUTH);
        expect(ScoreBoard(board)).to.eq(0);
        board = AddDominoToBoard(board, { head: 1, tail: 5 }, Direction.SOUTH);
        expect(ScoreBoard(board)).to.eq(25);
    });

    it("should correctly score boards starting without spinner", () => {
        let board = InitializeBoard();
        board = AddDominoToBoard(board, { head: 6, tail: 4 }, Direction.NONE);
        expect(ScoreBoard(board)).to.eq(10);
        board = AddDominoToBoard(board, { head: 4, tail: 1 }, Direction.EAST);
        expect(ScoreBoard(board)).to.eq(0);
        board = AddDominoToBoard(board, { head: 1, tail: 3 }, Direction.EAST);
        expect(ScoreBoard(board)).to.eq(0);
        board = AddDominoToBoard(board, { head: 2, tail: 6 }, Direction.WEST);
        expect(ScoreBoard(board)).to.eq(5);
        board = AddDominoToBoard(board, { head: 5, tail: 2 }, Direction.WEST);
        expect(ScoreBoard(board)).to.eq(0);
        board = AddDominoToBoard(board, { head: 3, tail: 5 }, Direction.EAST);
        expect(ScoreBoard(board)).to.eq(10);
        board = AddDominoToBoard(board, { head: 5, tail: 5 }, Direction.WEST);
        expect(ScoreBoard(board)).to.eq(15);
        board = AddDominoToBoard(board, { head: 5, tail: 0 }, Direction.WEST);
        expect(ScoreBoard(board)).to.eq(5);
        board = AddDominoToBoard(board, { head: 0, tail: 0 }, Direction.WEST);
        expect(ScoreBoard(board)).to.eq(5);
        board = AddDominoToBoard(board, { head: 5, tail: 1 }, Direction.NORTH);
        expect(ScoreBoard(board)).to.eq(0);
        board = AddDominoToBoard(board, { head: 5, tail: 4 }, Direction.SOUTH);
        expect(ScoreBoard(board)).to.eq(10);
    });

    it("should correctly identify valid and invalid placements", () => {
        let board = InitializeBoard();
        const d66 = { head: 6, tail: 6 };
        expect(VerifyPlacement(board, d66, Direction.NONE)).to.be.true;
        expect(VerifyPlacement(board, d66, Direction.EAST)).to.be.false;
        board = AddDominoToBoard(board, d66, Direction.NONE);
        const d63 = { head: 6, tail: 3 };
        expect(VerifyPlacement(board, d63, Direction.NONE)).to.be.false;
        expect(VerifyPlacement(board, d63, Direction.EAST)).to.be.true;
        expect(VerifyPlacement(board, d63, Direction.WEST)).to.be.true;
        expect(VerifyPlacement(board, d63, Direction.NORTH)).to.be.false;
        expect(VerifyPlacement(board, d63, Direction.SOUTH)).to.be.false;
        board = AddDominoToBoard(board, d63, Direction.EAST);
        const d33 = { head: 3, tail: 3 };
        expect(VerifyPlacement(board, d33, Direction.NONE)).to.be.false;
        expect(VerifyPlacement(board, d33, Direction.EAST)).to.be.true;
        expect(VerifyPlacement(board, d33, Direction.WEST)).to.be.false;
        expect(VerifyPlacement(board, d33, Direction.NORTH)).to.be.false;
        expect(VerifyPlacement(board, d33, Direction.SOUTH)).to.be.false;
        board = AddDominoToBoard(board, d33, Direction.EAST);
        const d60 = { head: 6, tail: 0 };
        expect(VerifyPlacement(board, d60, Direction.NONE)).to.be.false;
        expect(VerifyPlacement(board, d60, Direction.EAST)).to.be.false;
        expect(VerifyPlacement(board, d60, Direction.WEST)).to.be.true;
        expect(VerifyPlacement(board, d60, Direction.NORTH)).to.be.false;
        expect(VerifyPlacement(board, d60, Direction.SOUTH)).to.be.false;
        board = AddDominoToBoard(board, d60, Direction.WEST);
        const d62 = { head: 6, tail: 2 };
        expect(VerifyPlacement(board, d62, Direction.NONE)).to.be.false;
        expect(VerifyPlacement(board, d62, Direction.EAST)).to.be.false;
        expect(VerifyPlacement(board, d62, Direction.WEST)).to.be.false;
        expect(VerifyPlacement(board, d62, Direction.NORTH)).to.be.true;
        expect(VerifyPlacement(board, d62, Direction.SOUTH)).to.be.true;
        board = AddDominoToBoard(board, d62, Direction.SOUTH);
        const d43 = { head: 4, tail: 3 };
        expect(VerifyPlacement(board, d43, Direction.NONE)).to.be.false;
        expect(VerifyPlacement(board, d43, Direction.EAST)).to.be.true;
        expect(VerifyPlacement(board, d43, Direction.WEST)).to.be.false;
        expect(VerifyPlacement(board, d43, Direction.NORTH)).to.be.false;
        expect(VerifyPlacement(board, d43, Direction.SOUTH)).to.be.false;
        board = AddDominoToBoard(board, d43, Direction.EAST);
        const d64 = { head: 6, tail: 4 };
        expect(VerifyPlacement(board, d64, Direction.NONE)).to.be.false;
        expect(VerifyPlacement(board, d64, Direction.EAST)).to.be.true;
        expect(VerifyPlacement(board, d64, Direction.WEST)).to.be.false;
        expect(VerifyPlacement(board, d64, Direction.NORTH)).to.be.true;
        expect(VerifyPlacement(board, d64, Direction.SOUTH)).to.be.false;
        board = AddDominoToBoard(board, d64, Direction.NORTH);
        const d42 = { head: 4, tail: 2 };
        expect(VerifyPlacement(board, d42, Direction.NONE)).to.be.false;
        expect(VerifyPlacement(board, d42, Direction.EAST)).to.be.true;
        expect(VerifyPlacement(board, d42, Direction.WEST)).to.be.false;
        expect(VerifyPlacement(board, d42, Direction.NORTH)).to.be.true;
        expect(VerifyPlacement(board, d42, Direction.SOUTH)).to.be.true;
    });
});
