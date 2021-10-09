import _ from "lodash";
import { AddDominoToBoard, ScoreBoard } from "../Board";
import { Direction } from "../enums/Direction";
import { GameEventType } from "../enums/GameEventType";
import { QueryType } from "../enums/QueryType";
import { MaskedGameState } from "../interfaces/GameState";
import { Agent } from "./Agent";

const GreedyAgent: Agent = {
    process: (
        eventType: GameEventType,
        gameState: MaskedGameState,
        internalState: any
    ) => {
        return null;
    },
    respond: async (
        queryType: QueryType,
        gameState: MaskedGameState,
        internalState: any,
        options: { domino: number; direction: Direction }[]
    ): Promise<number> => {
        const bestOption = _.maxBy(options, (option) =>
            ScoreBoard(
                AddDominoToBoard(
                    gameState.board,
                    gameState.players[gameState.myIndex].hand[option.domino],
                    option.direction
                )
            )
        );
        console.log(
            `highest scoring option is ${options.findIndex(
                (option) => option === bestOption
            )} with a score of ${ScoreBoard(
                AddDominoToBoard(
                    gameState.board,
                    gameState.players[gameState.myIndex].hand[
                        bestOption.domino
                    ],
                    bestOption.direction
                )
            )}`
        );
        return options.findIndex((option) => option === bestOption);
    }
};

export default GreedyAgent;
