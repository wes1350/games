import { Board } from "./interfaces/Board";
import { Config } from "./Config";
import { Pack } from "./Pack";
import { Player } from "./Player";
import * as _ from "lodash";
import { GameMessageType } from "./enums/GameMessageType";
import { QueryType } from "./enums/QueryType";
import { Direction } from "./enums/Direction";
import { PossiblePlaysMessage } from "./interfaces/PossiblePlaysMessage";
import { GameState } from "./interfaces/GameState";
import { GameConfigMessage } from "./interfaces/GameConfigMessage";
import { PlayerDetails } from "../../interfaces/PlayerDetails";
import { Domino } from "./interfaces/Domino";
import { AddDomino } from "./BoardController";
import { ScoreBoard, BoardTextRep } from "./BoardViewModel";
import { DominoTextRep, IsDouble } from "./DominoViewModel";
import { GetValidPlacementsForHand, InitializeBoard } from "./BoardUtils";

export class Engine {
    private _config: Config;
    private _players: Player[];
    private _board: Board;
    private _pack: Pack;
    private _currentPlayerIndex: number;
    private _nPasses: number;
    private _broadcast: (type: GameMessageType, payload?: any) => void;
    private _emitToPlayer: (
        type: GameMessageType,
        payload: any,
        playerId: string
    ) => void;
    private _queryPlayer: (
        type: QueryType,
        message: string,
        playerId: string,
        options: any,
        gameState: GameState
    ) => Promise<any>;
    private _local?: boolean;

    public constructor(
        config: GameConfigMessage,
        playerDetails: PlayerDetails[],
        emitToPlayer: (
            type: any,
            payload: any,
            playerId: string
        ) => void = null,
        broadcast: (type: any, payload?: any) => void = null,
        queryPlayer: (
            type: any,
            payload: any,
            playerId: string,
            options: any,
            gameState: GameState
        ) => Promise<any> = null,
        local?: boolean
    ) {
        this._config = new Config(config);
        this._players = [];
        this._board = null;
        this._pack = null;
        const playerOrder = _.shuffle(_.range(playerDetails.length));
        playerDetails.forEach((playerInfo, i) => {
            this._players.push(
                new Player(playerInfo.id, playerOrder[i], playerInfo.name)
            );
        });

        this._currentPlayerIndex = null;
        this._nPasses = 0;

        this._broadcast = broadcast;
        this._emitToPlayer = emitToPlayer;
        this._queryPlayer = queryPlayer;
        this._local = local;
    }

    private getInitialPlayerRepresentationsForPlayer(
        playerId: string
    ): { seatNumber: number; name: string; isMe: boolean }[] {
        return this._players.map((player) => ({
            seatNumber: player.Index,
            name: player.Name,
            isMe: player.Id === playerId
        }));
    }

    private getPlayerByIndex(index: number): Player {
        return this._players.find((player) => player.Index === index);
    }

    public async RunGame(): Promise<string> {
        // Start and run a game until completion, handling game logic as necessary.
        this._players.forEach((player: Player) => {
            this._emitToPlayer(
                GameMessageType.GAME_START,
                this.getInitialPlayerRepresentationsForPlayer(player.Id),
                player.Id
            );
        });
        this.InitializeRound(true);

        let next_round_fresh = await this.PlayRound(true);
        while (!this.GameIsOver()) {
            this.InitializeRound(next_round_fresh);
            next_round_fresh = await this.PlayRound(next_round_fresh);
        }

        const scores = this.GetScores();

        const winner = scores.findIndex(
            (score: number) => score === Math.max(...scores)
        );
        return this.getPlayerByIndex(winner).Id;
    }

    public InitializeRound(fresh_round = false) {
        this._board = InitializeBoard();
        this.DrawHands(fresh_round);
        this._broadcast(GameMessageType.CLEAR_BOARD);
    }

    public async PlayRound(fresh_round = false) {
        if (fresh_round) {
            this._currentPlayerIndex = this.DetermineFirstPlayer();
        }
        this._broadcast(GameMessageType.NEW_ROUND, {
            currentPlayer: this.CurrentPlayer.Index
        });
        let blocked = false;
        let play_fresh = fresh_round;
        while (this.PlayersHaveDominoes() && !blocked && !this.GameIsOver()) {
            blocked = await this.PlayTurn(play_fresh);
            this.NextTurn();
            play_fresh = false;
        }
        if (blocked === null) {
            // Temporary case for disconnects
            return false;
        }

        if (!this.PlayersHaveDominoes()) {
            this._currentPlayerIndex =
                (this.CurrentPlayer.Index + this._config.NPlayers - 1) %
                this._config.NPlayers;
            const scoreOnDomino = this.GetValueOnDomino(
                this.CurrentPlayer.Index
            );
            this.CurrentPlayer.AddPoints(scoreOnDomino);
            this._broadcast(GameMessageType.SCORE, {
                seat: this.CurrentPlayer.Index,
                score: scoreOnDomino
            });
            this._broadcast(GameMessageType.PLAYER_DOMINOED);
            return false;
        } else if (blocked) {
            this._broadcast(GameMessageType.GAME_BLOCKED);
            const blockedResult = this.GetBlockedResult();
            const player = blockedResult.player;
            const total = blockedResult.total;

            if (player !== null) {
                this._broadcast(GameMessageType.SCORE, {
                    seat: player.Index,
                    score: total
                });
                player.AddPoints(total);
            }
            return true;
        } else {
            // Game is over
            return false;
        }
    }

    public async PlayTurn(play_fresh = false) {
        const move = await this.queryMove(this._currentPlayerIndex, play_fresh);
        if (move === null) {
            // Temporary case for disconnects
            return null;
        }
        const domino = move.domino;
        const direction = move.direction;
        if (domino !== null) {
            this._board = AddDomino(this._board, domino, direction);
            // const addedCoordinate = this._board.AddDomino(domino, direction);
            // const placementRep = this.GetPlacementRep(domino, direction);
            this.CurrentPlayer.RemoveDomino(domino);
            this._broadcast(GameMessageType.TURN, {
                seat: this.CurrentPlayer.Index,
                domino: {
                    head: domino.head,
                    tail: domino.tail
                },
                direction: null,
                // direction: placementRep.direction,
                coordinate: null
                // coordinate: {
                //     X: addedCoordinate.x,
                //     Y: addedCoordinate.y
                // }
            });

            this._emitToPlayer(
                GameMessageType.HAND,
                this.CurrentPlayer.HandTextRep,
                this.CurrentPlayer.Id
            );

            this._broadcast(GameMessageType.DOMINO_PLAYED, {
                seat: this.CurrentPlayer.Index
            });

            const score = ScoreBoard(this._board);

            if (score) {
                this._broadcast(GameMessageType.SCORE, {
                    seat: this.CurrentPlayer.Index,
                    score
                });
            }

            this.CurrentPlayer.AddPoints(score);
            this._nPasses = 0;
        } else {
            // Player passes
            this._nPasses += 1;

            this._broadcast(GameMessageType.TURN, {
                seat: this.CurrentPlayer.Index,
                domino: null,
                direction: null,
                coordinate: null
            });
        }
        if (this._nPasses == this._config.NPlayers) {
            return true;
        }

        if (this._local) {
            console.log("\n\n" + BoardTextRep(this._board) + "\n");
            console.log("scores:", this.GetScores(), "\n");
        }

        return false;
    }

    public NextTurn() {
        // Update the player to move.
        this._currentPlayerIndex =
            (this.CurrentPlayer.Index + 1) % this._config.NPlayers;
    }

    public DrawHands(fresh_round = false) {
        while (true) {
            this._pack = new Pack();
            const hands = [];
            for (let i = 0; i < this._config.NPlayers; i++) {
                hands.push(this._pack.Pull(this._config.HandSize));
            }
            if (
                this.VerifyHands(hands, fresh_round, this._config.Check5Doubles)
            ) {
                for (let i = 0; i < this._config.NPlayers; i++) {
                    const player = this.getPlayerByIndex(i);
                    player.AssignHand(hands[i]);
                    this._emitToPlayer(
                        GameMessageType.HAND,
                        player.HandTextRep,
                        player.Id
                    );
                }
                return;
            }
        }
    }

    public VerifyHands(
        hands: Domino[][],
        check_any_double = false,
        check_5_doubles = true
    ) {
        if (!check_5_doubles && !check_any_double) {
            return true;
        }

        // Check that no hand has 5 doubles
        let no_doubles = true;
        hands.forEach((hand) => {
            const n_doubles = hand.filter((d) => IsDouble(d)).length;
            if (check_5_doubles) {
                if (n_doubles >= 5) {
                    return false;
                }
                if (n_doubles > 0) {
                    no_doubles = false;
                }
            }
        });
        // Check that some hand has a double
        if (check_any_double) {
            if (no_doubles) {
                return false;
            }
        }

        return true;
    }

    public DetermineFirstPlayer(): number {
        // Determine who has the largest double, and thus who will play first.
        // Assumes each player's hand is assigned and a double exists among them.
        for (let i = 6; i >= 0; i--) {
            for (let p = 0; p < this._config.NPlayers; p++) {
                for (const domino of this.getPlayerByIndex(p).Hand) {
                    if (domino.head === i && domino.tail === i) {
                        return p;
                    }
                }
            }
        }
        throw new Error("Could not find double in any player's hands");
    }

    public PlayersHaveDominoes() {
        return Math.min(...this._players.map((p) => p.Hand.length)) > 0;
    }

    public GameIsOver() {
        return Math.max(...this.GetScores()) >= this._config.WinThreshold;
    }

    public GetScores(): number[] {
        return this._players.map((player) => player.Score);
    }

    public async queryMove(
        playerIndex: number,
        play_fresh = false
    ): Promise<{ domino: Domino; direction: Direction }> {
        const player = this.getPlayerByIndex(playerIndex);
        while (true) {
            const possible_placements = GetValidPlacementsForHand(
                this._board,
                player.Hand,
                play_fresh
            );
            if (this._local) {
                console.log("Possible placements:");
                possible_placements.forEach((el) => {
                    console.log(
                        ` --- ${el.index}: ${DominoTextRep(
                            el.domino
                        )}, [${el.dirs.join(", ")}]`
                    );
                });
            }

            const possiblePlays = {
                plays: _.flatten(
                    possible_placements.map((placement) =>
                        placement.dirs.map((dir) => ({
                            domino: placement.index,
                            direction: dir
                        }))
                    )
                )
            } as PossiblePlaysMessage;

            const move_possible = !!possible_placements.find(
                (p) => p.dirs.length > 0
            );
            if (move_possible) {
                try {
                    this._emitToPlayer(
                        GameMessageType.POSSIBLE_PLAYS,
                        possiblePlays,
                        player.Id
                    );
                    const response: { domino: number; direction: string } =
                        await this._queryPlayer(
                            QueryType.MOVE,
                            `${player.Name}, make a move`,
                            player.Id,
                            possiblePlays.plays,
                            this.getGameStateForPlayer(player.Index)
                        );
                    if (response === null) {
                        // Temporary case for disconnects
                        return null;
                    }
                    const dominoIndex = response.domino;
                    const domino = possible_placements[dominoIndex].domino;

                    if (
                        !(
                            0 <= dominoIndex &&
                            dominoIndex <= possible_placements.length
                        ) ||
                        possible_placements[dominoIndex].dirs.length === 0
                    ) {
                        this._emitToPlayer(
                            GameMessageType.ERROR,
                            "Invalid domino choice: " + dominoIndex.toString(),
                            player.Id
                        );
                        continue;
                    }

                    let direction = response.direction as Direction;

                    if (possible_placements[dominoIndex].dirs.length == 1) {
                        direction = possible_placements[dominoIndex].dirs[0];
                    } else {
                        if (
                            !possible_placements[dominoIndex].dirs.includes(
                                direction
                            )
                        ) {
                            this._emitToPlayer(
                                GameMessageType.ERROR,
                                "Invalid domino choice: " +
                                    dominoIndex.toString(),
                                player.Id
                            );
                            continue;
                        }
                    }

                    return {
                        domino: domino,
                        direction: direction
                    };
                } catch (err) {
                    console.error(err);
                    this._emitToPlayer(
                        GameMessageType.ERROR,
                        "Invalid input, try again",
                        player.Id
                    );
                }
            } else {
                const pulled = this._pack.Pull();

                if (pulled !== null) {
                    this._broadcast(GameMessageType.PULL, {
                        seat: this.CurrentPlayer.Index
                    });
                    player.AddDomino(pulled[0]);
                    this._emitToPlayer(
                        GameMessageType.HAND,
                        player.HandTextRep,
                        player.Id
                    );
                } else {
                    return { domino: null, direction: null };
                }
            }
        }
    }

    public GetValueOnDomino(playerIndex: number) {
        // Get the value of a 'Domino' by a player, i.e. the sum, rounded to the
        // nearest 5, of the other players' hand totals.
        let total = this._players
            .filter((player) => player.Index !== playerIndex)
            .map((p) => p.HandTotal)
            .reduce((a, b) => a + b, 0);

        if (total % 5 > 2) {
            total += 5 - (total % 5);
        } else {
            total -= total % 5;
        }
        return total;
    }

    public GetBlockedResult(): { player: Player; total: number } {
        // Find the player (if any) that wins points when the game is blocked and return
        // that player and the points they receive.
        const totals = this._players.map((p) => p.HandTotal);
        if (totals.filter((t) => t === Math.min(...totals)).length > 1) {
            // Multiple players have lowest count, so nobody gets points
            return { player: null, total: 0 };
        } else {
            // Find the player with minimum score and the sum of the other players' hands, rounded to the nearest 5
            const scorer = this._players.find(
                (player) => player.HandTotal === Math.min(...totals)
            );
            let total = totals.reduce((a, b) => a + b, 0) - Math.min(...totals);
            if (total % 5 > 2) {
                total += 5 - (total % 5);
            } else {
                total -= total % 5;
            }
            return { player: scorer, total: total };
        }
    }

    // public GetPlacementRep(domino: Domino, addedDirection: Direction) {
    //     // After adding a domino to the board, return how it will look in its rendered form
    //     let dominoOrientationDirection: Direction;
    //     if (
    //         addedDirection === Direction.NONE ||
    //         addedDirection === Direction.EAST ||
    //         addedDirection === Direction.WEST
    //     ) {
    //         if (domino.IsDouble) {
    //             dominoOrientationDirection = Direction.SOUTH;
    //         } else {
    //             dominoOrientationDirection = domino.IsReversed
    //                 ? Direction.WEST
    //                 : Direction.EAST;
    //         }
    //     } else if (
    //         addedDirection === Direction.NORTH ||
    //         addedDirection === Direction.SOUTH
    //     ) {
    //         if (domino.IsDouble) {
    //             dominoOrientationDirection = Direction.EAST;
    //         } else {
    //             dominoOrientationDirection = domino.IsReversed
    //                 ? Direction.NORTH
    //                 : Direction.SOUTH;
    //         }
    //     }

    //     const dominoCoordinates =
    //         addedDirection === Direction.NONE
    //             ? { x: 0, y: 0 }
    //             : addedDirection === Direction.NORTH
    //             ? this._board.NorthEdge
    //             : addedDirection === Direction.EAST
    //             ? this._board.EastEdge
    //             : addedDirection === Direction.SOUTH
    //             ? this._board.SouthEdge
    //             : addedDirection === Direction.WEST
    //             ? this._board.WestEdge
    //             : null;

    //     return {
    //         face1: domino.Head,
    //         face2: domino.Tail,
    //         direction: dominoOrientationDirection,
    //         x: dominoCoordinates.x,
    //         y: dominoCoordinates.y
    //     };
    // }

    public get Players(): Player[] {
        return this._players;
    }

    public get CurrentPlayer(): Player {
        return this.getPlayerByIndex(this._currentPlayerIndex);
    }

    private getPlayerDescriptionOfSelf(seat: number, player: Player) {
        return {
            seatNumber: seat,
            score: player.Score,
            hand: player.Hand.map((domino) => ({
                head: domino.head,
                tail: domino.tail
            }))
        };
    }

    private getPlayerDescriptionOfOpponent(seat: number, opponent: Player) {
        return {
            seatNumber: seat,
            score: opponent.Score,
            dominoesInHand: opponent.Hand.length
        };
    }

    private getPlayerRepresentations(seat: number) {
        const me = this._players.find((p) => p.Index === seat);
        const opponents = this._players.filter((p) => p.Index !== seat);
        return {
            me: this.getPlayerDescriptionOfSelf(seat, me),
            opponents: opponents.map((opponent) =>
                this.getPlayerDescriptionOfOpponent(seat, opponent)
            )
        };
    }

    private getGameStateForPlayer(playerIndex: number): GameState {
        return {
            config: this._config.ConfigDescription,
            seatNumberForTurn: this._currentPlayerIndex, // maybe need to go back one player for event notification, depending on call order
            board: this._board,
            players: this.getPlayerRepresentations(playerIndex)
        };
    }
}

module.exports = { Engine };
