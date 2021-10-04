import { GameType } from "../../common/enums/GameType";
import { GameConfigMessage } from "./interfaces/GameConfigMessage";

export class Config {
    private nPlayers: number;
    private handSize: number;
    private winThreshold: number;
    private check5Doubles: boolean;

    constructor(config?: GameConfigMessage) {
        this.nPlayers = 4;
        this.handSize = 7;
        this.winThreshold = 150;
        this.check5Doubles = true;

        if (config) {
            this.nPlayers = config.nPlayers ?? this.nPlayers;
            this.check5Doubles = config.check5Doubles ?? this.check5Doubles;
            this.winThreshold = config.winThreshold ?? this.winThreshold;
            this.handSize = config.handSize ?? this.handSize;
        }
    }

    public get NPlayers(): number {
        return this.nPlayers;
    }

    public get HandSize(): number {
        return this.handSize;
    }

    public get WinThreshold(): number {
        return this.winThreshold;
    }

    public get Check5Doubles(): boolean {
        return this.check5Doubles;
    }

    public get ConfigDescription(): GameConfigMessage {
        return {
            gameType: GameType.DOMINOES,
            nPlayers: this.NPlayers,
            handSize: this.HandSize,
            check5Doubles: this.Check5Doubles,
            winThreshold: this.WinThreshold
        };
    }
}
