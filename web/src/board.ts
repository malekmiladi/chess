import { Color, Piece, Pawn, Rook, Bishop, Knight, King, Queen, Move } from './pieces.js'
import { Notifier } from './notifier.js'

export type MoveOperation = {
    success: boolean;
    move: Move;
    take: boolean;
}

export type Kings = {
    b: number;
    w: number;
}

export type Rooks = {
    qs: {
        b: number;
        w: number;
    };
    ks: {
        b: number;
        w: number;
    }
}

export type Castles = {
    
}

export class Board {

    notifier: Notifier;
    state: (Piece | undefined)[];
    prevStates: (Piece | undefined)[][];
    territory: Set<number>[];
    kings: Kings;
    rooks: Rooks;

    constructor(notifier: Notifier) {
        this.territory = [];
        this.state = [];
        this.prevStates = [];
        this.kings = {
            b: 4,
            w: 60
        }
        this.rooks = {
            qs: {
                b: 0,
                w: 56
            },
            ks: {
                b: 7,
                w: 63
            }
        }
        this.notifier = notifier;
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
        let wK = this.state[this.kings.w];
        let bK = this.state[this.kings.b];
        wK?.generateLegalMoves(this.kings.w, this);
        bK?.generateLegalMoves(this.kings.b, this);
        const wKAttackedSquares = wK?.getAttackedSquares();
        const bKAttackedSquares = bK?.getAttackedSquares();
        const intersection = wKAttackedSquares?.filter(
            (square: number) => bKAttackedSquares?.includes(square)
        );
        if (bKAttackedSquares) {
            for (const square of bKAttackedSquares) {
                if (!intersection?.includes(square)) {
                    this.territory[square].add(Color.BLACK);
                }
            }
        }
        if (wKAttackedSquares) {
            for (const square of wKAttackedSquares) {
                if (!intersection?.includes(square)) {
                    this.territory[square].add(Color.WHITE);
                }
            }
        }
    }

    movePiece(move: Move, whitesTurn: boolean): MoveOperation {
        let op: MoveOperation = {
            success: false,
            move: move,
            take: false
        }
        const piece: (Piece | undefined) = this.state[move.from];
        if ((piece?.color == Color.WHITE && whitesTurn) || (piece?.color == Color.BLACK && !whitesTurn)) {
            const opponentPiece: (Piece | undefined) = this.state[move.to];
            if (piece?.isLegalMove(move.to)) {
                this.prevStates.push([...this.state]);
                if (opponentPiece) {
                    op.take = true;
                    this.takePiece(move.to);
                }
                this.state[move.from] = undefined;
                if (piece instanceof Pawn || piece instanceof King || piece instanceof Rook) {
                    if (piece.isFirstMove()) {
                        piece.setFirstMove(false);
                    }
                }
                this.state[move.to] = piece;
                this.updateLeglMoves();
                op.success = true;
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

}
