import {Bishop, Color, King, Knight, Move, MoveGenOptions, Pawn, Piece, Queen, Rook} from './pieces.js'
import {Notifier} from './notifier.js'
import {Utils} from "./utils.js";
import {GameEventType} from "./game-events.js";
import {Arbiter, AttackPath} from "./arbiter.js";
import {GameState} from "./game.js";
import {CustomStates} from "./custom-states.js";

export enum CastleSide {
    KING_SIDE,
    QUEEN_SIDE
}

export type LegalMovesHighlightOptions = {
    legalMoves: number[];
    hasPiece: boolean;
}

export enum MoveType {
    MOVE,
    TAKE,
    CASTLE,
    EN_PASSANT,
    PROMOTION,
    PROMOTION_AND_TAKE
}

export enum Ranks {
    EIGHTH = 7,
    SEVENTH = 6,
    SIXTH = 5,
    FIFTH = 4,
    FOURTH = 3,
    THIRD = 2,
    SECOND = 1,
    FIRST = 0
}

export type NormalMove = {
    move: Move
};

export type CastleMove = {
    rook: Move;
    move: Move;
};

export type EnPassantMove = {
    move: Move;
    opponent: number;
}

export type MoveAction = NormalMove | CastleMove | EnPassantMove;


export type MoveOperation = {
    type: MoveType;
    action: MoveAction;
}

// b: black
// w: white
export type Kings = {
    b: number;
    w: number;
}

export enum Promotions {
    QUEEN,
    ROOK,
    BISHOP,
    KNIGHT
}

export const CASTLE_SQUARES = {
    QS: {
        AS_WHITE: {
            B: {
                KING: {
                    FROM: 4,
                    TO: 2
                },
                ROOK: {
                    FROM: 0,
                    TO: 3
                }
            },
            W: {
                KING: {
                    FROM: 60,
                    TO: 58
                },
                ROOK: {
                    FROM: 56,
                    TO: 59
                }
            }
        },
        AS_BLACK: {
            W: {
                KING: {
                    FROM: 3,
                    TO: 1
                },
                ROOK: {
                    FROM: 0,
                    TO: 2
                }
            },
            B: {
                KING: {
                    FROM: 3,
                    TO: 5
                },
                ROOK: {
                    FROM: 7,
                    TO: 4
                }
            }
        }
    },
    KS: {
        AS_WHITE: {
            B: {
                KING: {
                    FROM: 4,
                    TO: 6
                },
                ROOK: {
                    FROM: 7,
                    TO: 5
                }
            },
            W: {
                KING: {
                    FROM: 60,
                    TO: 62
                },
                ROOK: {
                    FROM: 63,
                    TO: 61
                }
            }
        },
        AS_BLACK: {
            W: {
                KING: {
                    FROM: 59,
                    TO: 57
                },
                ROOK: {
                    FROM: 56,
                    TO: 58
                }
            },
            B: {
                KING: {
                    FROM: 59,
                    TO: 61
                },
                ROOK: {
                    FROM: 63,
                    TO: 60
                }
            }
        }
    }
}

export class Board {

    notifier: Notifier;
    arbiter: Arbiter;
    state: (Piece | undefined)[];
    prevStates: (Piece | undefined)[][];
    territory: Set<number>[];
    kings: Kings;
    promotionInProgress: { square: number, forWhite: boolean };

    constructor(notifier: Notifier, arbiter: Arbiter) {
        this.territory = [];
        this.state = [];
        this.prevStates = [];
        this.notifier = notifier;
        this.arbiter = arbiter;
        this.kings = {
            b: CASTLE_SQUARES.KS.AS_WHITE.B.KING.FROM,
            w: CASTLE_SQUARES.KS.AS_WHITE.W.KING.FROM
        } as Kings;
        this.promotionInProgress = {
            square: -1,
            forWhite: true
        };

        this.initialize();
        this.updateLegalMoves(null, true);
    }

    initialize(): void {
        this.state.push(
            new Rook(0, Color.BLACK),
            new Knight(1, Color.BLACK),
            new Bishop(2, Color.BLACK),
            new Queen(3, Color.BLACK),
            new King(4, Color.BLACK),
            new Bishop(5, Color.BLACK),
            new Knight(6, Color.BLACK),
            new Rook(7, Color.BLACK),
        )
        for (let i: number = 0; i < 8; i++) {
            this.state.push(new Pawn(i + 8, Color.BLACK));
        }
        for (let i: number = 0; i < 32; i++) {
            this.state.push(undefined);
        }
        for (let i: number = 0; i < 8; i++) {
            this.state.push(new Pawn(i + 48, Color.WHITE));
        }
        this.state.push(
            new Rook(56, Color.WHITE),
            new Knight(57, Color.WHITE),
            new Bishop(58, Color.WHITE),
            new Queen(59, Color.WHITE),
            new King(60, Color.WHITE),
            new Bishop(61, Color.WHITE),
            new Knight(62, Color.WHITE),
            new Rook(63, Color.WHITE),
        )
    }

    // TODO: can't be bothered to optimize this for now...
    resetTerritory(): void {
        this.territory = [];
        for (let i: number = 0; i < 64; i++) {
            this.territory.push(new Set());
        }
    }

    updateLegalMoves(ignoreSquare: number | null, playAsWhite: boolean): void {
        this.resetTerritory();

        // REMEMBER findKingAttackingPieces and findPinnedPieces should be different because for findPinnedPieces,
        // we're checking individual rays, and not all legal moves of opponent pinning piece
        const bkChecks = this.arbiter.findKingAttackingPieces(this.kings.b, this.state, Color.BLACK);
        const wkChecks = this.arbiter.findKingAttackingPieces(this.kings.w, this.state, Color.WHITE);

        const bkInCheck = bkChecks.length > 0;
        const wkInCheck = wkChecks.length > 0;

        const pinnedByWhite: AttackPath[] = this.arbiter.findPinnedPieces(this.kings.b, this.state, Color.BLACK);
        const pinnedByBlack: AttackPath[] = this.arbiter.findPinnedPieces(this.kings.w, this.state, Color.WHITE);

        const moveGenOpts: MoveGenOptions = {state: this.state, territory: this.territory};

        for (let i: number = 0; i < 64; i++) {

            const piece = this.state[i];

            if (piece) {
                const isPawn = piece instanceof Pawn;
                const isEnPassantVulnerable = isPawn && (ignoreSquare !== i) && piece.enPassantVulnerable;

                if (isEnPassantVulnerable) {
                    piece.enPassantVulnerable = false;
                }

                if (piece.color === Color.WHITE) {
                    piece.generateLegalMoves(i, moveGenOpts, pinnedByBlack, wkChecks);
                } else {
                    piece.generateLegalMoves(i, moveGenOpts, pinnedByWhite, bkChecks);
                }

                const attackedSquares: number[] = piece.getAttackedSquares();
                for (const square of attackedSquares) {
                    this.territory[square].add(piece.color);
                }
            }
        }

        let bK = <King>this.state[this.kings.b];
        let wK = <King>this.state[this.kings.w];

        const wKAttackedSquares = wK.getSurroundingSquares(this.kings.w);
        const bKAttackedSquares = bK.getSurroundingSquares(this.kings.b);

        for (const square of bKAttackedSquares) {
            this.territory[square].add(Color.BLACK);
        }

        for (const square of wKAttackedSquares) {
            this.territory[square].add(Color.WHITE);
        }

        wK.generateLegalMoves(this.kings.w, this, [], wkChecks);
        bK.generateLegalMoves(this.kings.b, this, [], bkChecks);

        let adjustedBKSquare: number;
        let adjustedWKSquare: number;

        if (playAsWhite) {
            adjustedWKSquare = Utils.adjustSquareFor(Color.WHITE, this.kings.b);
            adjustedBKSquare = Utils.adjustSquareFor(Color.WHITE, this.kings.b);
        } else {
            adjustedBKSquare = Utils.adjustSquareFor(Color.BLACK, this.kings.b);
            adjustedWKSquare = Utils.adjustSquareFor(Color.BLACK, this.kings.w);
        }

        if (bkInCheck) {
            this.notifier.notify({
                type: GameEventType.CHECK,
                square: adjustedBKSquare
            });
            this.arbiter.bKInCheck = true;
        } else {
            this.notifier.notify({
                type: GameEventType.CLEAR_CHECK,
                square: adjustedBKSquare
            });
            this.arbiter.bKInCheck = false;
        }

        if (wkInCheck) {
            this.notifier.notify({
                type: GameEventType.CHECK,
                square: adjustedWKSquare
            });
            this.arbiter.wKInCheck = true;
        } else {
            this.notifier.notify({
                type: GameEventType.CLEAR_CHECK,
                square: adjustedWKSquare
            });
            this.arbiter.wKInCheck = false;
        }

    }

    determineMoveType(piece: Piece, opponentPiece: (Piece | undefined), move: Move): MoveType {
        const [, yFrom] = Utils.toXY(move.from);
        const [xTo, yTo] = Utils.toXY(move.to);

        switch (piece.constructor) {
            case King:
                if (Math.abs(move.to - move.from) === 2) {
                    return MoveType.CASTLE;
                }
                break;
            case Pawn:
                if (!opponentPiece && (yFrom !== yTo)) {
                    return MoveType.EN_PASSANT;
                }
                if (xTo === Ranks.EIGHTH || xTo === Ranks.FIRST) {
                    if (opponentPiece) {
                        return MoveType.PROMOTION_AND_TAKE;
                    }
                    return MoveType.PROMOTION;
                }
                break;
        }

        if (opponentPiece) {
            return MoveType.TAKE;
        }

        return MoveType.MOVE;
    }

    getCastleSquares(move: Move): Move {
        let from: number;
        let to: number;

        switch (move.to) {
            case CASTLE_SQUARES.QS.AS_WHITE.B.KING.TO:
                from = CASTLE_SQUARES.QS.AS_WHITE.B.ROOK.FROM;
                to = CASTLE_SQUARES.QS.AS_WHITE.B.ROOK.TO;
                break
            case CASTLE_SQUARES.KS.AS_WHITE.B.KING.TO:
                from = CASTLE_SQUARES.KS.AS_WHITE.B.ROOK.FROM;
                to = CASTLE_SQUARES.KS.AS_WHITE.B.ROOK.TO;
                break
            case CASTLE_SQUARES.QS.AS_WHITE.W.KING.TO:
                from = CASTLE_SQUARES.QS.AS_WHITE.W.ROOK.FROM;
                to = CASTLE_SQUARES.QS.AS_WHITE.W.ROOK.TO;
                break;
            case CASTLE_SQUARES.KS.AS_WHITE.W.KING.TO:
                from = CASTLE_SQUARES.KS.AS_WHITE.W.ROOK.FROM;
                to = CASTLE_SQUARES.KS.AS_WHITE.W.ROOK.TO;
                break;

            case CASTLE_SQUARES.QS.AS_BLACK.B.KING.TO:
                from = CASTLE_SQUARES.QS.AS_BLACK.B.ROOK.FROM;
                to = CASTLE_SQUARES.QS.AS_BLACK.B.ROOK.TO;
                break
            case CASTLE_SQUARES.KS.AS_BLACK.B.KING.TO:
                from = CASTLE_SQUARES.KS.AS_BLACK.B.ROOK.FROM;
                to = CASTLE_SQUARES.KS.AS_BLACK.B.ROOK.TO;
                break
            case CASTLE_SQUARES.QS.AS_BLACK.W.KING.TO:
                from = CASTLE_SQUARES.QS.AS_BLACK.W.ROOK.FROM;
                to = CASTLE_SQUARES.QS.AS_BLACK.W.ROOK.TO;
                break;
            case CASTLE_SQUARES.KS.AS_BLACK.W.KING.TO:
                from = CASTLE_SQUARES.KS.AS_BLACK.W.ROOK.FROM;
                to = CASTLE_SQUARES.KS.AS_BLACK.W.ROOK.TO;
                break;


            default:
                from = move.from;
                to = move.to;
                break;
        }

        return {from: from, to: to};
    }

    movePiece(move: Move, gameState: GameState): void {

        let op: MoveOperation = {
            type: MoveType.MOVE,
            action: {
                move: move
            }
        };

        const adjustedMove: Move = gameState.playAsWhite ? move : Utils.adjustMoveFor(Color.BLACK, move);

        const piece: (Piece | undefined) = this.state[adjustedMove.from];
        const opponentPiece: (Piece | undefined) = this.state[adjustedMove.to];

        if (piece && piece.isLegalMove(adjustedMove.to)) {
            this.arbiter.moves++;

            const isWhitesTurn: boolean = piece.color === Color.WHITE && gameState.whiteTurn;
            const isBlacksTurn: boolean = piece.color === Color.BLACK && !gameState.whiteTurn;

            if (isWhitesTurn || isBlacksTurn) {

                this.prevStates.push([...this.state]);

                const [xFrom,] = Utils.toXY(adjustedMove.from);
                const [xTo, yTo] = Utils.toXY(adjustedMove.to);

                op.type = this.determineMoveType(piece, opponentPiece, adjustedMove);
                let newEnPassant: number | null = null;

                switch (op.type) {
                    case MoveType.TAKE: {
                        this.takePiece(adjustedMove.to);
                        op.type = MoveType.TAKE;
                        break;
                    }
                    case MoveType.CASTLE: {
                        const castleSquares = this.getCastleSquares(move);
                        const adjustedCastleSquares = this.getCastleSquares(adjustedMove);
                        op.type = MoveType.CASTLE;
                        op.action.move = move;
                        (<CastleMove>op.action).rook = castleSquares;
                        const rook: Rook = <Rook>this.state[adjustedCastleSquares.from];
                        this.state[adjustedCastleSquares.from] = undefined;
                        this.state[adjustedCastleSquares.to] = rook;
                        break;
                    }
                    case MoveType.EN_PASSANT: {
                        const xIncrement = piece.color === Color.BLACK ? -1 : 1;
                        const opponentSquare = Utils.toSquare(xTo + xIncrement, yTo);
                        const adjustedOpponentSquare = gameState.playAsWhite ? opponentSquare : Utils.adjustSquareFor(Color.BLACK, opponentSquare);
                        this.takePiece(opponentSquare);
                        op.action = {
                            move: move,
                            opponent: adjustedOpponentSquare
                        }
                        break;
                    }
                    case MoveType.PROMOTION:
                    case MoveType.PROMOTION_AND_TAKE: {
                        if (opponentPiece) {
                            this.takePiece(adjustedMove.to);
                        }
                        this.promotionInProgress.square = adjustedMove.to;
                        this.promotionInProgress.forWhite = gameState.playAsWhite;
                        break;
                    }
                }

                const isPawn = piece instanceof Pawn;
                const isKing = piece instanceof King;
                const isRook = piece instanceof Rook;

                if (isPawn || isKing || isRook) {
                    if (piece.firstMove) {
                        piece.firstMove = false;
                    }
                    if (isKing) {
                        if (piece.color === Color.BLACK) {
                            this.kings.b = adjustedMove.to;
                        } else {
                            this.kings.w = adjustedMove.to;
                        }
                    }
                }

                const pawn2SquaresMove = Math.abs(xTo - xFrom) === 2;
                if (isPawn && pawn2SquaresMove) {
                    piece.enPassantVulnerable = true;
                    newEnPassant = adjustedMove.to;
                }

                this.state[adjustedMove.from] = undefined;
                this.state[adjustedMove.to] = piece;
                this.updateLegalMoves(newEnPassant, gameState.playAsWhite);

                this.notifier.notify({
                    type: GameEventType.UPDATE_DISPLAY,
                    op: op
                });

                if (this.promotionInProgress.square !== -1) {
                    this.notifier.notify({
                        type: GameEventType.PROMOTION,
                        color: piece.color
                    });
                }
            }
        }
    }

    promotePiece(choice: number, playAsWhite: boolean) {
        let pawn = <Pawn>this.state[this.promotionInProgress.square];
        const promotionSquare = this.promotionInProgress.square;

        switch (choice) {
            case Promotions.QUEEN: {
                this.state[this.promotionInProgress.square] = new Queen(pawn.id, pawn.color);
                break;
            }
            case Promotions.ROOK: {
                const rook = new Rook(pawn.id, pawn.color);
                rook.firstMove = false;
                this.state[this.promotionInProgress.square] = rook;
                break;
            }
            case Promotions.BISHOP: {
                this.state[this.promotionInProgress.square] = new Bishop(pawn.id, pawn.color);
                break;
            }
            case Promotions.KNIGHT: {
                this.state[this.promotionInProgress.square] = new Knight(pawn.id, pawn.color);
                break;
            }
        }

        this.updateLegalMoves(null, playAsWhite);
        this.promotionInProgress.square = -1;
        const adjustedPromotionSquare = this.promotionInProgress.forWhite ? promotionSquare : Utils.adjustSquareFor(Color.BLACK, promotionSquare);
        this.notifier.notify({
            type: GameEventType.PROMOTION_SUCCESS,
            square: adjustedPromotionSquare,
            choice: choice,
            color: pawn.color
        })
    }

    takePiece(to: number): void {
        this.state[to] = undefined;
    }

    getLegalMoves(square: number, forWhite: boolean): LegalMovesHighlightOptions {
        let pieceHighlightOptions: LegalMovesHighlightOptions = {
            legalMoves: [],
            hasPiece: false
        }
        const adjustedSquare = forWhite ? square : Utils.adjustSquareFor(Color.BLACK, square);
        const piece: (Piece | undefined) = this.state[adjustedSquare];
        if (piece) {
            pieceHighlightOptions.legalMoves = forWhite ? piece.legalMoves : Utils.adjustLegalMoves(Color.BLACK, piece.legalMoves);
            pieceHighlightOptions.hasPiece = true;
        }
        return pieceHighlightOptions;
    }

    getCurrentState(): (Piece | undefined)[] {
        return this.state;
    }

}
