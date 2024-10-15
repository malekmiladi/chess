import { Color, Piece, Pawn, Rook, Bishop, Knight, King, Queen, Move } from './pieces.js'
import { Notifier } from './notifier.js'

export type MoveOperation = {
    success: boolean;
    move: Move;
    take: boolean;
}

export class Board {

    notifier: Notifier;
    currState: (Piece | undefined)[] = [];
    prevStates: (Piece | undefined)[][] = [];
    underBlackAttack: boolean[] = new Array(64).fill(false);
    underWhiteAttack: boolean[] = new Array(64).fill(false);

    constructor(notifier: Notifier) {
        this.notifier = notifier;
        this.initiateBoard();
        this.updateLeglMoves();
        for (const piece of this.currState) {
            if (piece) {
                console.log(piece);
            }
        }
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
        for (let i: number = 16; i < 24; i++) {
            this.underBlackAttack[i] = true;
        }
        for (let i: number = 40; i < 48; i++) {
            this.underWhiteAttack[i] = true;
        }
    }

    updateLeglMoves() {
        for (let i: number = 0; i < 64; i++) {
            const piece = this.currState[i];
            if (piece) {
                piece.generateLegalMoves(i, this);
            }
        }
    }

    getAttackedSquares(color: Color) {
        switch(color) {
            case Color.BLACK:
                return this.underBlackAttack;
            case Color.WHITE:
                return this.underWhiteAttack;
        }
    }

    movePiece(move: Move): MoveOperation {
        let op: MoveOperation = {
            success: true,
            move: move,
            take: false
        }
        const piece: (Piece | undefined) = this.currState[move.current];
        const opponentPiece: (Piece | undefined) = this.currState[move.target];
        console.log(move.target, piece?.legalMoves, piece?.isLegalMove(move.target));
        if (piece?.isLegalMove(move.target)) {
            if (opponentPiece) {
                op.take = true;
                this.takePiece(move.target);
            }
            this.currState[move.current] = undefined;
            var attackedSquares: number[] = piece.getAttackedSquares();
            for (const index of attackedSquares) {
                if (piece.color == Color.BLACK) {
                    this.underBlackAttack[index] = false;
                } else {
                    this.underWhiteAttack[index] = false;
                }
            }
            piece.generateLegalMoves(move.target, this);
            attackedSquares = piece.getAttackedSquares();
            for (const index of attackedSquares) {
                if (piece.color == Color.BLACK) {
                    this.underBlackAttack[index] = true;
                } else {
                    this.underWhiteAttack[index] = true;
                }
            }
            if (piece instanceof Pawn) {
                if (piece.firstMove) {
                    piece.firstMove = false;
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
