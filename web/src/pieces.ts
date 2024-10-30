import {Board, CastleSide} from "./board.js";
import {Utils} from "./utils.js";
import {MOVE_CHECKS} from "./arbiter.js";
import {Sprite, Sprites} from "./sprites.js";

export enum Color {
    WHITE = 1,
    BLACK = 2
}

export enum Promotions {
    QUEEN,
    ROOK,
    BISHOP,
    KNIGHT
}

export type Move = {
    from: number,
    to: number
}

export type Step = {
    x: number,
    y: number
}

export interface Piece {
    id: number;
    color: Color;
    sprite: Sprite;
    moveChecks: Step[];
    legalMoves: number[];
    defendedPieces: number[];

    getAttackedSquares(): number[];

    generateLegalMoves(square: number, board: Board): void;

    isLegalMove(to: number): boolean;
}

export class Pawn implements Piece {
    private firstMove: boolean = true;
    private enPassant: boolean = false;
    private attackedSquares: number[] = [];
    private enPassantChecks: Step[] = [
        {x: 0, y: 1},
        {x: 0, y: -1}
    ];

    id: number;
    moveChecks: Step[];
    color: Color;
    sprite: Sprite;
    legalMoves: number[] = [];
    defendedPieces: number[] = [];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        if (color === Color.WHITE) {
            this.sprite = Sprites.PAWN.W;
            this.moveChecks = MOVE_CHECKS.PAWN.W
        } else {
            this.sprite = Sprites.PAWN.B;
            this.moveChecks = MOVE_CHECKS.PAWN.B
        }
    }

    isFirstMove() {
        return this.firstMove;
    }

    setFirstMove(isFirstMove: boolean) {
        this.firstMove = isFirstMove;
    }

    isEnPassant(): boolean {
        return this.enPassant;
    }

    public setEnPassant(enPassant: boolean): void {
        this.enPassant = enPassant;
    }

    getAttackedSquares(): number[] {
        return this.attackedSquares.concat(this.defendedPieces);
    }

    generateLegalMoves(square: number, board: Board): void {
        this.legalMoves = [];
        this.defendedPieces = [];
        this.attackedSquares = [];
        let pieceOnTheWay: boolean = false;
        const [x, y]: [number, number] = Utils.toXY(square);
        for (let i: number = 0; i < this.moveChecks.length && !pieceOnTheWay; i++) {
            const step: Step = this.moveChecks[i];
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds(x1, y1)) {
                const square: number = Utils.toSquare(x1, y1);
                const otherPiece: (Piece | undefined) = board.state[square];
                if (step.y !== 0) {
                    this.attackedSquares.push(square);
                    if (otherPiece) {
                        if (otherPiece.color !== this.color) {
                            this.legalMoves.push(square);
                        } else {
                            this.defendedPieces.push(square);
                        }
                    }
                } else {
                    if (!otherPiece && !pieceOnTheWay) {
                        if ((Math.abs(step.x) === 1) || ((Math.abs(step.x) === 2) && this.firstMove)) {
                            this.legalMoves.push(square);
                        }
                    } else {
                        pieceOnTheWay = true;
                    }
                }
            }
        }
        for (const step of this.enPassantChecks) {
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds(x1, y1)) {
                const square: number = Utils.toSquare(x1, y1);
                const otherPiece: (Piece | undefined) = board.state[square];
                if (otherPiece) {
                    const isOpponent = otherPiece.color !== this.color;
                    const isPawn = otherPiece instanceof Pawn;
                    if (isOpponent) {
                        if (isPawn) {
                            if (otherPiece.isEnPassant()) {
                                const xIncrement = this.color === Color.BLACK ? 1 : -1;
                                const enPassantSquare = Utils.toSquare(x1 + xIncrement, y1);
                                this.legalMoves.push(enPassantSquare);
                            }
                        }
                    }
                }
            }
        }
    }

    isLegalMove(to: number): boolean {
        return this.legalMoves.includes(to);
    }

}

export class King implements Piece {
    id: number;
    moveChecks: Step[] = MOVE_CHECKS.KING;
    private firstMove: boolean = true;
    color: Color;
    sprite: Sprite;
    legalMoves: number[] = [];
    defendedPieces: number[] = [];
    surroundingSquares: number[] = []

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        if (color === Color.WHITE) {
            this.sprite = Sprites.KING.W;
        } else {
            this.sprite = Sprites.KING.B;
        }
    }

    public isFirstMove() {
        return this.firstMove;
    }

    public setFirstMove(isFirstMove: boolean) {
        this.firstMove = isFirstMove;
    }

    getAttackedSquares(): number[] {
        return this.legalMoves.concat(this.defendedPieces);
    }

    getSurroundingSquares(square: number): number[] {
        this.surroundingSquares = [];
        const [x, y]: [number, number] = Utils.toXY(square);
        for (const step of this.moveChecks) {
            const [x1, y1] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds(x1, y1)) {
                this.surroundingSquares.push(Utils.toSquare(x1, y1));
            }
        }
        return this.surroundingSquares;
    }

    getCastleSquare(rook: (Rook | undefined), boardState: (Piece | undefined)[], start: number, end: number, ks: boolean): number {
        let pathObstructed: boolean = false;
        if (rook?.isFirstMove()) {
            let i: number = start + 1;
            while (i < end && !pathObstructed) {
                if (boardState[i] !== undefined) {
                    pathObstructed = true;
                }
                i++;
            }
            if (!pathObstructed) {
                if (ks) {
                    return end - 1;
                } else {
                    return end - 2;
                }
            }
        }
        return -1;
    }

    generateCastleMoves(board: Board): number[] {
        let castleMoves: number[] = [];
        let [ksStart, ksEnd]: [number, number] = [-1, -1];
        let [qsStart, qsEnd]: [number, number] = [-1, -1];
        if (this.firstMove) {

            [ksStart, ksEnd] = board.getCastleRange(this.color, CastleSide.KING_SIDE);
            [qsStart, qsEnd] = board.getCastleRange(this.color, CastleSide.QUEEN_SIDE);

            const ksRook: (Piece | undefined) = board.state[ksEnd];
            const ksCastleSquare = this.getCastleSquare(<Rook>ksRook, board.state, ksStart, ksEnd, true);
            if (ksCastleSquare !== -1) {
                castleMoves.push(ksCastleSquare);
            }

            const qsRook: (Piece | undefined) = board.state[qsStart];
            const qsCastleSquare = this.getCastleSquare(<Rook>qsRook, board.state, qsStart, qsEnd, false);
            if (qsCastleSquare !== -1) {
                castleMoves.push(qsCastleSquare);
            }
        }

        return castleMoves;
    }

    generateLegalMoves(square: number, board: Board): void {
        this.legalMoves = [];
        this.defendedPieces = [];
        this.surroundingSquares = [];
        const adversary: Color = this.color === Color.BLACK ? Color.WHITE : Color.BLACK;
        const [x, y]: [number, number] = Utils.toXY(square);
        for (const step of this.moveChecks) {
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds(x1, y1)) {
                const square: number = Utils.toSquare(x1, y1);
                this.surroundingSquares.push(square);
                if (!board.isUnderAttack(square, adversary)) {
                    const piece: (Piece | undefined) = board.state[square];
                    if (!piece || (piece.color !== this.color)) {
                        this.legalMoves.push(square);
                    } else if (piece.color === this.color) {
                        this.defendedPieces.push(square);
                    }
                }
            }
        }
        const castles: number[] = this.generateCastleMoves(board);
        this.legalMoves = this.legalMoves.concat(castles);
    }

    isLegalMove(to: number): boolean {
        return this.legalMoves.includes(to);
    }
}

export class Queen implements Piece {
    id: number;
    moveChecks: Step[] = MOVE_CHECKS.QUEEN;
    color: Color;
    sprite: Sprite;
    legalMoves: number[] = [];
    defendedPieces: number[] = [];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        if (color === Color.WHITE) {
            this.sprite = Sprites.QUEEN.W;
        } else {
            this.sprite = Sprites.QUEEN.B;
        }
    }

    getAttackedSquares(): number[] {
        return this.legalMoves.concat(this.defendedPieces);
    }

    walkPath(startSquare: number, step: Step, board: Board) {
        let stopWalking: boolean = false;
        let squareIndex: number = startSquare;
        let kingInPath: boolean = false;
        while ((squareIndex < 64 && squareIndex > -1) && !stopWalking) {
            const [x, y]: [number, number] = Utils.toXY(squareIndex);
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds(x1, y1)) {
                const square: number = Utils.toSquare(x1, y1);
                if (square > -1 && square < 64) {
                    const piece: (Piece | undefined) = board.state[square];
                    if (!piece) {
                        if (!kingInPath) {
                            this.legalMoves.push(square);
                        } else {
                            this.defendedPieces.push(square);
                        }
                    } else {
                        if ((piece instanceof King) && (piece.color !== this.color)) {
                            kingInPath = true;
                        } else {
                            stopWalking = true;
                        }
                        if (piece.color !== this.color && !kingInPath) {
                            this.legalMoves.push(square);
                        } else {
                            this.defendedPieces.push(square);
                        }
                    }
                    squareIndex = square;
                } else {
                    stopWalking = true;
                }
            } else {
                stopWalking = true;
            }
        }
    }

    generateLegalMoves(square: number, board: Board): void {
        this.legalMoves = [];
        this.defendedPieces = [];
        for (const step of this.moveChecks) {
            this.walkPath(square, step, board);
        }
    }

    isLegalMove(to: number): boolean {
        return this.legalMoves.includes(to);
    }
}

export class Bishop implements Piece {
    id: number;
    moveChecks: Step[] = MOVE_CHECKS.BISHOP;
    color: Color;
    sprite: Sprite;
    legalMoves: number[] = [];
    defendedPieces: number[] = [];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        if (color === Color.WHITE) {
            this.sprite = Sprites.BISHOP.W;
        } else {
            this.sprite = Sprites.BISHOP.B;
        }
    }

    getAttackedSquares(): number[] {
        return this.legalMoves.concat(this.defendedPieces);
    }

    walkPath(startSquare: number, step: Step, board: Board) {
        let stopWalking: boolean = false;
        let squareIndex: number = startSquare;
        let kingInPath: boolean = false;
        while ((squareIndex < 64 && squareIndex > -1) && !stopWalking) {
            const [x, y]: [number, number] = Utils.toXY(squareIndex);
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds(x1, y1)) {
                const square: number = Utils.toSquare(x1, y1);
                if (square > -1 && square < 64) {
                    const piece: (Piece | undefined) = board.state[square];
                    if (!piece) {
                        if (!kingInPath) {
                            this.legalMoves.push(square);
                        } else {
                            this.defendedPieces.push(square);
                        }
                    } else {
                        if ((piece instanceof King) && (piece.color !== this.color)) {
                            kingInPath = true;
                        } else {
                            stopWalking = true;
                        }
                        if (piece.color !== this.color && !kingInPath) {
                            this.legalMoves.push(square);
                        } else {
                            this.defendedPieces.push(square);
                        }
                    }
                    squareIndex = square;
                } else {
                    stopWalking = true;
                }
            } else {
                stopWalking = true;
            }
        }
    }

    generateLegalMoves(square: number, board: Board): void {
        this.legalMoves = [];
        this.defendedPieces = [];
        for (const step of this.moveChecks) {
            this.walkPath(square, step, board);
        }
    }

    isLegalMove(to: number): boolean {
        return this.legalMoves.includes(to);
    }
}

export class Knight implements Piece {
    id: number;
    moveChecks: Step[] = MOVE_CHECKS.KNIGHT;
    color: Color;
    sprite: Sprite;
    legalMoves: number[] = [];
    defendedPieces: number[] = [];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        if (color === Color.WHITE) {
            this.sprite = Sprites.KNIGHT.W;
        } else {
            this.sprite = Sprites.KNIGHT.B;
        }
    }

    getAttackedSquares(): number[] {
        return this.legalMoves.concat(this.defendedPieces);
    }

    generateLegalMoves(square: number, board: Board): void {
        this.legalMoves = [];
        this.defendedPieces = [];
        for (const step of this.moveChecks) {
            const [x, y]: [number, number] = Utils.toXY(square);
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds(x1, y1)) {
                const square: number = Utils.toSquare(x1, y1);
                const piece: (Piece | undefined) = board.state[square];
                if (!piece || (piece.color !== this.color)) {
                    this.legalMoves.push(square);
                } else if (piece.color === this.color) {
                    this.defendedPieces.push(square);
                }
            }
        }
    }

    isLegalMove(to: number): boolean {
        return this.legalMoves.includes(to);
    }
}

export class Rook implements Piece {
    id: number;
    moveChecks: Step[] = MOVE_CHECKS.ROOK;
    private firstMove: boolean = true;
    color: Color;
    sprite: Sprite;
    legalMoves: number[] = [];
    defendedPieces: number[] = [];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        if (color === Color.WHITE) {
            this.sprite = Sprites.ROOK.W;
        } else {
            this.sprite = Sprites.ROOK.B;
        }
    }

    public isFirstMove() {
        return this.firstMove;
    }

    public setFirstMove(isFirstMove: boolean) {
        this.firstMove = isFirstMove;
    }

    getAttackedSquares(): number[] {
        return this.legalMoves.concat(this.defendedPieces);
    }

    walkPath(startSquare: number, step: Step, board: Board) {
        let stopWalking: boolean = false;
        let squareIndex: number = startSquare;
        let kingInPath: boolean = false;
        while ((squareIndex < 64 && squareIndex > -1) && !stopWalking) {
            const [x, y]: [number, number] = Utils.toXY(squareIndex);
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds(x1, y1)) {
                const square: number = Utils.toSquare(x1, y1);
                if (square > -1 && square < 64) {
                    const piece: (Piece | undefined) = board.state[square];
                    if (!piece) {
                        if (!kingInPath) {
                            this.legalMoves.push(square);
                        } else {
                            this.defendedPieces.push(square);
                        }
                    } else {
                        if ((piece instanceof King) && (piece.color !== this.color)) {
                            kingInPath = true;
                        } else {
                            stopWalking = true;
                        }
                        if (piece.color !== this.color && !kingInPath) {
                            this.legalMoves.push(square);
                        } else {
                            this.defendedPieces.push(square);
                        }
                    }
                    squareIndex = square;
                } else {
                    stopWalking = true;
                }
            } else {
                stopWalking = true;
            }
        }
    }

    generateLegalMoves(square: number, board: Board): void {
        this.legalMoves = [];
        this.defendedPieces = [];
        for (const step of this.moveChecks) {
            this.walkPath(square, step, board);
        }
    }

    isLegalMove(to: number): boolean {
        return this.legalMoves.includes(to);
    }
}