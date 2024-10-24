import { Color, Piece, Pawn, Rook, Bishop, Knight, King, Queen, Move } from './pieces.js'
import { Notifier } from './notifier.js'

export enum CastleSide {
    KING_SIDE,
    QUEEN_SIDE
}

export enum MoveType {
    MOVE,
    TAKE,
    CASTLE,
    EN_PASSANT
}

export type MoveAction = {
        move: Move;
    }
    | {
        rook: Move;
        move: Move;
    } | {
        move: Move;
        opoonent: number;
    }


export type MoveOperation = {
    success: boolean;
    type: MoveType;
    action: MoveAction;
}

// b: black
// w: white
export type Kings = {
    b: number;
    w: number;
}

export class Board {

    readonly CASTLE_SQUARES = {
        QS: {
            B: {
                FROM: {
                    KING: 4,
                    ROOK: 0,
                },
                TO: {
                    KING: 2,
                    ROOK: 3,
                }
            },
            W: {
                FROM: {
                    KING: 60,
                    ROOK: 56,
                },
                TO: {
                    KING: 58,
                    ROOK: 59
                }
            }
        },
        KS: {
            B: {
                FROM: {
                    KING: 4,
                    ROOK: 7,
                },
                TO: {
                    KING: 6,
                    ROOK: 5
                }
            },
            W: {
                FROM: {
                    KING: 60,
                    ROOK: 63,
                },
                TO: {
                    KING: 62,
                    ROOK: 61
                }
            }
        }
    }

    notifier: Notifier;
    state: (Piece | undefined)[];
    prevStates: (Piece | undefined)[][];
    territory: Set<number>[];
    kings: Kings;

    constructor(notifier: Notifier) {
        this.territory = [];
        this.state = [];
        this.prevStates = [];
        this.notifier = notifier;
        this.kings = {
            b: this.CASTLE_SQUARES.KS.B.FROM.KING,
            w: this.CASTLE_SQUARES.KS.W.FROM.KING
        } as Kings
        this.initiateBoard();
        this.updateLeglMoves();
    }

    initiateBoard(): void {
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

    isUnderAttack(square: number, adversary: Color): boolean {
        return this.territory[square].has(adversary);
    }

    updateLeglMoves(): void {
        // TODO: add pinned pieces logic, and line of sight on king
        this.territory = [];
        for (let i: number = 0; i < 64; i++) {
            this.territory.push(new Set());
        }
        for (let i: number = 0; i < 64; i++) {
            const piece = this.state[i];
            if (piece) {
                if (piece instanceof King) {
                    if (piece.color == Color.BLACK) {
                        this.kings.b = i;
                    } else {
                        this.kings.w = i;
                    }
                } else {
                    piece.generateLegalMoves(i, this);
                    const attackedSquares: number[] = piece.getAttackedSquares();
                    for (const square of attackedSquares) {
                        this.territory[square].add(piece.color);
                    }
                }
            }
        }

        let wK = <Rook>this.state[this.kings.w];
        let bK = <Rook>this.state[this.kings.b];

        wK.generateLegalMoves(this.kings.w, this);
        bK.generateLegalMoves(this.kings.b, this);

        const wKAttackedSquares = wK.getAttackedSquares();
        const bKAttackedSquares = bK.getAttackedSquares();

        const intersection = wKAttackedSquares.filter(
            (square: number) => bKAttackedSquares.includes(square)
        );
        if (bKAttackedSquares) {
            for (const square of bKAttackedSquares) {
                if (!intersection.includes(square)) {
                    this.territory[square].add(Color.BLACK);
                }
            }
        }
        if (wKAttackedSquares) {
            for (const square of wKAttackedSquares) {
                if (!intersection.includes(square)) {
                    this.territory[square].add(Color.WHITE);
                }
            }
        }
    }

    movePiece(move: Move, whitesTurn: boolean): MoveOperation {
        // TODO: ugly code -> pretty code
        let op: MoveOperation = {
            success: false,
            type: MoveType.MOVE,
            action: {
                move: {
                    from: -1,
                    to: -1
                }
            }
        };

        const piece: (Piece | undefined) = this.state[move.from];
        if (piece) {
            const isWhitesTurn: boolean = piece.color == Color.WHITE && whitesTurn;
            const isBlacksTurn: boolean = piece.color == Color.BLACK && !whitesTurn;
            if (isWhitesTurn || isBlacksTurn) {
                const opponentPiece: (Piece | undefined) = this.state[move.to];
                if (piece.isLegalMove(move.to)) {
                    this.prevStates.push([...this.state]);
                    if (opponentPiece) {
                        op.type = MoveType.TAKE;
                        op.action = { move: move } as MoveAction;
                        this.takePiece(move.to);
                    }
                    this.state[move.from] = undefined;
                    if (piece instanceof Pawn || piece instanceof King || piece instanceof Rook) {
                        if (piece.isFirstMove()) {
                            piece.setFirstMove(false);
                        }
                    }
                    if (piece instanceof King) {
                        if (Math.abs(move.to - move.from) === 2) {
                            op.type = MoveType.CASTLE;
                            switch (move.to) {
                                case this.CASTLE_SQUARES.QS.B.TO.KING:
                                    op.action = {
                                        rook: {
                                            from: this.CASTLE_SQUARES.QS.B.FROM.ROOK,
                                            to: this.CASTLE_SQUARES.QS.B.TO.ROOK
                                        },
                                        move: move
                                    } as MoveAction;
                                    break
                                case this.CASTLE_SQUARES.KS.B.TO.KING:
                                    op.action = {
                                        rook: {
                                            from: this.CASTLE_SQUARES.KS.B.FROM.ROOK,
                                            to: this.CASTLE_SQUARES.KS.B.TO.ROOK
                                        },
                                        move: move
                                    } as MoveAction;
                                    break
                                case this.CASTLE_SQUARES.QS.W.TO.KING:
                                    op.action = {
                                        rook: {
                                            from: this.CASTLE_SQUARES.QS.W.FROM.ROOK,
                                            to: this.CASTLE_SQUARES.QS.W.TO.ROOK
                                        },
                                        move: move
                                    } as MoveAction;
                                    break;
                                case this.CASTLE_SQUARES.KS.W.TO.KING:
                                    op.action = {
                                        rook: {
                                            from: this.CASTLE_SQUARES.KS.W.FROM.ROOK,
                                            to: this.CASTLE_SQUARES.KS.W.TO.ROOK
                                        },
                                        move: move
                                    } as MoveAction;
                                    break;
                            }
                            const action = <{ rook: Move; move: Move; }>op.action;
                            const rook: Piece = <Rook>this.state[action.rook.from];
                            this.state[action.rook.from] = undefined;
                            this.state[action.rook.to] = rook;
                        }
                    }
                    this.state[move.to] = piece;
                    this.updateLeglMoves();
                    op.success = true;
                }
            }
        }
        return op;
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
                    return [this.CASTLE_SQUARES.KS.B.FROM.KING, this.CASTLE_SQUARES.KS.B.FROM.ROOK];
                } else {
                    return [this.CASTLE_SQUARES.QS.B.FROM.ROOK, this.CASTLE_SQUARES.QS.B.FROM.KING];
                }
            case Color.WHITE:
                if (side === CastleSide.KING_SIDE) {
                    return [this.CASTLE_SQUARES.KS.W.FROM.KING, this.CASTLE_SQUARES.KS.W.FROM.ROOK];
                } else {
                    return [this.CASTLE_SQUARES.QS.W.FROM.ROOK, this.CASTLE_SQUARES.QS.W.FROM.KING];
                }
        }
    }

}
