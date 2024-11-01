import {Bishop, Color, King, Knight, Move, Pawn, Piece, Queen, Rook} from './pieces.js'
import {Notifier} from './notifier.js'
import {Utils} from "./utils.js";
import {GameEventType} from "./game-events.js";
import {CustomStates} from "./custom-states.js";
import {Arbiter} from "./arbiter.js";

export enum CastleSide {
    KING_SIDE,
    QUEEN_SIDE
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

export class Board {

    readonly CASTLE_SQUARES = {
        QS: {
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
        KS: {
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
        }
    }

    notifier: Notifier;
    arbiter: Arbiter;
    state: (Piece | undefined)[];
    prevStates: (Piece | undefined)[][];
    territory: Set<number>[];
    kings: Kings;
    promotionInProgress: { square: number };

    constructor(notifier: Notifier, arbiter: Arbiter) {
        this.territory = [];
        this.state = [];
        this.prevStates = [];
        this.notifier = notifier;
        this.arbiter = arbiter;
        this.kings = {
            b: this.CASTLE_SQUARES.KS.B.KING.FROM,
            w: this.CASTLE_SQUARES.KS.W.KING.FROM
        } as Kings
        this.promotionInProgress = {
            square: -1
        };

        this.state = CustomStates.PinScenario();
        // this.state = CustomStates.KingsQueenKnight();
        // this.initialize();
        this.updateLegalMoves(null);
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

    isUnderAttack(square: number, adversary: Color): boolean {
        return this.territory[square].has(adversary);
    }

    updateLegalMoves(ignoreEnPassantFor: number | null): void {
        // TODO: add pinned pieces logic, and line of sight on king
        this.resetTerritory();

        const bkAttackers = this.arbiter.findKingAttackingPieces(this.kings.b, this.state, Color.BLACK);
        const wkAttackers = this.arbiter.findKingAttackingPieces(this.kings.w, this.state, Color.WHITE);

        const piecesPinnedByWhite = this.arbiter.findPinnedPieces(this.kings.b, this.state, Color.BLACK);
        const piecesPinnedByBlack = this.arbiter.findPinnedPieces(this.kings.w, this.state, Color.WHITE);

        console.log("White checks: ", bkAttackers);
        console.log("Black checks: ", wkAttackers);

        console.log("Pieces pinned by black: ", piecesPinnedByBlack);
        console.log("Pieces pinned by white: ", piecesPinnedByWhite);

        for (let i: number = 0; i < 64; i++) {
            const piece = this.state[i];
            if (piece) {
                if (piece instanceof Pawn) {
                    if ((ignoreEnPassantFor !== i) && piece.isEnPassant()) {
                        piece.setEnPassantVulnerable(false);
                    }
                }
                piece.generateLegalMoves(i, this);
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

        wK.generateLegalMoves(this.kings.w, this);
        bK.generateLegalMoves(this.kings.b, this);

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


    handleCastleMove(move: Move, op: MoveOperation): void {
        switch (move.to) {
            case this.CASTLE_SQUARES.QS.B.KING.TO:
                op.action = {
                    rook: {
                        from: this.CASTLE_SQUARES.QS.B.ROOK.FROM,
                        to: this.CASTLE_SQUARES.QS.B.ROOK.TO
                    },
                    move: move
                };
                break
            case this.CASTLE_SQUARES.KS.B.KING.TO:
                op.action = {
                    rook: {
                        from: this.CASTLE_SQUARES.KS.B.ROOK.FROM,
                        to: this.CASTLE_SQUARES.KS.B.ROOK.TO
                    },
                    move: move
                };
                break
            case this.CASTLE_SQUARES.QS.W.KING.TO:
                op.action = {
                    rook: {
                        from: this.CASTLE_SQUARES.QS.W.ROOK.FROM,
                        to: this.CASTLE_SQUARES.QS.W.ROOK.TO
                    },
                    move: move
                };
                break;
            case this.CASTLE_SQUARES.KS.W.KING.TO:
                op.action = {
                    rook: {
                        from: this.CASTLE_SQUARES.KS.W.ROOK.FROM,
                        to: this.CASTLE_SQUARES.KS.W.ROOK.TO
                    },
                    move: move
                };
                break;
        }
        const action = <CastleMove>op.action;
        const rook: Rook = <Rook>this.state[action.rook.from];
        this.state[action.rook.from] = undefined;
        this.state[action.rook.to] = rook;
    }

    movePiece(move: Move, whitesTurn: boolean): void {

        let op: MoveOperation = {
            type: MoveType.MOVE,
            action: {
                move: move
            }
        };

        const piece: (Piece | undefined) = this.state[move.from];
        const opponentPiece: (Piece | undefined) = this.state[move.to];

        if (piece && piece.isLegalMove(move.to)) {

            const isWhitesTurn: boolean = piece.color === Color.WHITE && whitesTurn;
            const isBlacksTurn: boolean = piece.color === Color.BLACK && !whitesTurn;

            if (isWhitesTurn || isBlacksTurn) {

                this.prevStates.push([...this.state]);

                const [xFrom,] = Utils.toXY(move.from);
                const [xTo, yTo] = Utils.toXY(move.to);

                op.type = this.determineMoveType(piece, opponentPiece, move);
                let newEnPassant: number | null = null;

                switch (op.type) {
                    case MoveType.TAKE: {
                        this.takePiece(move.to);
                        break;
                    }
                    case MoveType.CASTLE: {
                        this.handleCastleMove(move, op);
                        break;
                    }
                    case MoveType.EN_PASSANT: {
                        const xIncrement = piece.color === Color.BLACK ? -1 : 1;
                        const opponentSquare = Utils.toSquare(xTo + xIncrement, yTo);
                        this.takePiece(opponentSquare);
                        op.action = {
                            move: move,
                            opponent: opponentSquare
                        }
                        break;
                    }
                    case MoveType.PROMOTION:
                    case MoveType.PROMOTION_AND_TAKE: {
                        if (opponentPiece) {
                            this.takePiece(move.to);
                        }
                        this.promotionInProgress.square = move.to;
                        break;
                    }
                }

                const isPawn = piece instanceof Pawn;
                const isKing = piece instanceof King;
                const isRook = piece instanceof Rook;

                if (isPawn || isKing || isRook) {
                    if (piece.isFirstMove()) {
                        piece.setFirstMove(false);
                    }
                    if (isKing) {
                        if (piece.color === Color.BLACK) {
                            this.kings.b = move.to;
                        } else {
                            this.kings.w = move.to;
                        }
                    }
                }

                const pawn2SquaresMove = Math.abs(xTo - xFrom) === 2;
                if (isPawn && pawn2SquaresMove) {
                    piece.setEnPassantVulnerable(true);
                    newEnPassant = move.to;
                }

                this.state[move.from] = undefined;
                this.state[move.to] = piece;
                this.updateLegalMoves(newEnPassant);

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

    promotePiece(choice: number) {
        let pawn = <Pawn>this.state[this.promotionInProgress.square];
        const promotionSquare = this.promotionInProgress.square;

        switch (choice) {
            case Promotions.QUEEN: {
                this.state[this.promotionInProgress.square] = new Queen(pawn.id, pawn.color);
                break;
            }
            case Promotions.ROOK: {
                const rook = new Rook(pawn.id, pawn.color);
                rook.setFirstMove(false);
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

        this.updateLegalMoves(null);
        this.promotionInProgress.square = -1;
        this.notifier.notify({
            type: GameEventType.PROMOTION_SUCCESS,
            square: promotionSquare,
            choice: choice,
            color: pawn.color
        })
    }

    takePiece(to: number): void {
        this.state[to] = undefined;
    }

    getLegalMoves(square: number): number[] {
        let legalMoves: number[] = [];
        const piece: (Piece | undefined) = this.state[square];
        if (piece) {
            legalMoves = piece.legalMoves;
        }
        return legalMoves;
    }

    getCurrentState(): (Piece | undefined)[] {
        return this.state;
    }

    getCastleRange(color: Color, side: CastleSide): [number, number] {
        switch (color) {
            case Color.BLACK:
                if (side === CastleSide.KING_SIDE) {
                    return [this.CASTLE_SQUARES.KS.B.KING.FROM, this.CASTLE_SQUARES.KS.B.ROOK.FROM];
                } else {
                    return [this.CASTLE_SQUARES.QS.B.ROOK.FROM, this.CASTLE_SQUARES.QS.B.KING.FROM];
                }
            case Color.WHITE:
                if (side === CastleSide.KING_SIDE) {
                    return [this.CASTLE_SQUARES.KS.W.KING.FROM, this.CASTLE_SQUARES.KS.W.ROOK.FROM];
                } else {
                    return [this.CASTLE_SQUARES.QS.W.ROOK.FROM, this.CASTLE_SQUARES.QS.W.KING.FROM];
                }
        }
    }

}
