import { Color, Piece, Pawn, Rook, Bishop, Knight, King, Queen, Move } from './pieces.js'
import { Notifier } from './notifier.js'

export type MoveOperation = {
    success: boolean;
    move: Move;
    take: boolean;
}

export type KingIndex = {
    wK: number;
    bK: number;
}

export class Board {

    notifier: Notifier;
    currState: (Piece | undefined)[];
    prevStates: (Piece | undefined)[][];
    territory: Set<number>[];
    kings: KingIndex;

    constructor(notifier: Notifier) {
        this.territory = [];
        this.currState = [];
        this.prevStates = [];
        this.kings = {
            bK: 4,
            wK: 60
        }
        this.notifier = notifier;
        this.initiateBoard();
        this.updateLeglMoves();
    }

    initiateBoard() {
        this.currState.push(
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
            this.currState.push(new Pawn(i + 8, Color.BLACK));
        }
        for (let i: number = 0; i < 32; i++) {
            this.currState.push(undefined);
        }
        for (let i: number = 0; i < 8; i++) {
            this.currState.push(new Pawn(i + 48, Color.WHITE));
        }
        this.currState.push(
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

    updateLeglMoves() {
        this.territory = new Array(64).fill(new Set<number>());
        console.log(this.territory);
        for (let i: number = 0; i < 64; i++) {
            const piece = this.currState[i];
            if (piece) {
                if (piece instanceof King) {
                    if (piece.color == Color.BLACK) {
                        this.kings.bK = i;
                    } else {
                        this.kings.wK = i;
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
        const wK = this.currState[this.kings.wK];
        const bK = this.currState[this.kings.bK];
        wK?.generateLegalMoves(this.kings.wK, this);
        bK?.generateLegalMoves(this.kings.bK, this);
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
        console.log(this.currState);
        console.log(this.territory);
    }

    movePiece(move: Move): MoveOperation {
        let op: MoveOperation = {
            success: true,
            move: move,
            take: false
        }
        const piece: (Piece | undefined) = this.currState[move.current];
        const opponentPiece: (Piece | undefined) = this.currState[move.target];
        if (piece?.isLegalMove(move.target)) {
            this.prevStates.push([...this.currState]);
            if (opponentPiece) {
                op.take = true;
                this.takePiece(move.target);
            }
            this.currState[move.current] = undefined;
            if (piece instanceof Pawn || piece instanceof King || piece instanceof Rook) {
                if (piece.isFirstMove()) {
                    piece.setFirstMove(false);
                }
            }
            this.currState[move.target] = piece;
            this.updateLeglMoves();
            return op;
        }
        op.success = false;
        return op;
    }

    takePiece(target: number): void {
        this.currState[target] = undefined;
    }

}
