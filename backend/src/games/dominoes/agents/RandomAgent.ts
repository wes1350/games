import _ from "lodash";
import { Direction } from "../enums/Direction";
import { GameEventType } from "../enums/GameEventType";
import { QueryType } from "../enums/QueryType";
import { MaskedGameState } from "../interfaces/GameState";
import { Agent } from "./Agent";

const RandomAgent: Agent = {
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
        return _.sample(_.range(options.length));
    }
};

export default RandomAgent;
