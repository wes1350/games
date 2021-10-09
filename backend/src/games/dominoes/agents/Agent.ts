import { Direction } from "../enums/Direction";
import { GameEventType } from "../enums/GameEventType";
import { QueryType } from "../enums/QueryType";
import { MaskedGameState } from "../interfaces/GameState";

export interface Agent {
    // These methods should be async - need to make sure we handle this right
    process: (
        eventType: GameEventType,
        gameState: MaskedGameState,
        internalState: any
    ) => Promise<any>;
    respond: (
        queryType: QueryType,
        gameState: MaskedGameState,
        internalState: any,
        options: { domino: number; direction: Direction }[]
    ) => Promise<number>;
}
