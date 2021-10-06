import _ from "lodash";
import { BoardController } from "../BoardController";
import { BoardViewModel } from "../BoardViewModel";
import { Direction } from "../enums/Direction";
import { GameEventType } from "../enums/GameEventType";
import { QueryType } from "../enums/QueryType";
import { GameStateUtils } from "../GameStateUtils";
import { GameState } from "../interfaces/GameState";
import { Agent } from "./Agent";

const GreedyAgent: Agent = {
    process: (
        eventType: GameEventType,
        gameState: GameState,
        internalState: any
    ) => {
        return null;
    },
    respond: async (
        queryType: QueryType,
        gameState: GameState,
        internalState: any,
        options: { domino: number; direction: Direction }[]
    ): Promise<number> => {
        const bestOption = _.maxBy(options, (option) =>
            BoardViewModel.Score(
                BoardController.AddDomino(
                    gameState.board,
                    gameState.players.me.hand[option.domino],
                    option.direction
                )
            )
        );
        console.log(
            `highest scoring option is ${options.findIndex(
                (option) => option === bestOption
            )} with a score of ${BoardViewModel.Score(
                BoardController.AddDomino(
                    gameState.board,
                    gameState.players.me.hand[bestOption.domino],
                    bestOption.direction
                )
            )}`
        );
        return options.findIndex((option) => option === bestOption);
    }
};

export default GreedyAgent;
