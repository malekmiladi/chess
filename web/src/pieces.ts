import { Board } from "./board.js";
import { sprites, Sprite } from "./sprites.js";
import { Utils } from "./utils.js";

export enum Color {
    WHITE = 1,
    BLACK = 2
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
    private attackedSquares: number[] = [];

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
            this.sprite = sprites.pawn.white;
            this.moveChecks = [
                { x: -1, y: -1 },
                { x: -1, y: 1 },
                { x: -1, y: 0 },
                { x: -2, y: 0 }
            ]
        } else {
            this.sprite = sprites.pawn.black;
            this.moveChecks = [
                { x: 1, y: -1 },
                { x: 1, y: 1 },
                { x: 1, y: 0 },
                { x: 2, y: 0 }
            ]
        }
    }

    public isFirstMove() {
        return this.firstMove;
    }

    public setFirstMove(isFirstMove: boolean) {
        this.firstMove = isFirstMove;
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
            if (Utils.xyWithingBounds([x1, y1])) {
                const square: number = Utils.toIndex(x1, y1);
                const opponent: (Piece | undefined) = board.state[square];
                if (step.y != 0) {
                    this.attackedSquares.push(square);
                    if (opponent) {
                        if (opponent.color != this.color) {
                            this.legalMoves.push(square);
                        } else {
                            this.defendedPieces.push(square);
                        }
                    }
                } else {
                    if (!opponent && !pieceOnTheWay) {
                        if ((Math.abs(step.x) == 1) || ((Math.abs(step.x) == 2) && this.firstMove)) {
                            this.legalMoves.push(square);
                        }
                    } else {
                        pieceOnTheWay = true;
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
    moveChecks: Step[] = [
        { x: -1, y: -1 },
        { x: -1, y: 0 },
        { x: -1, y: 1 },
        { x: 1, y: -1 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: -1 },
        { x: 0, y: 1 }
    ];
    private firstMove: boolean = true;
    color: Color;
    sprite: Sprite;
    legalMoves: number[] = [];
    defendedPieces: number[] = [];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        if (color === Color.WHITE) {
            this.sprite = sprites.king.white;
        } else {
            this.sprite = sprites.king.black;
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
            switch (this.color) {
                case Color.BLACK:
                    [ksStart, ksEnd] = board.castles.ks.b;
                    [qsStart, qsEnd] = board.castles.qs.b;
                    break;
                case Color.WHITE:
                    [ksStart, ksEnd] = board.castles.ks.w;
                    [qsStart, qsEnd] = board.castles.qs.w;
                    break;
            }

            
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
        const adversary: Color = this.color == Color.BLACK ? Color.WHITE : Color.BLACK;
        const [x, y]: [number, number] = Utils.toXY(square);
        for (const step of this.moveChecks) {
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds([x1, y1])) {
                const square: number = Utils.toIndex(x1, y1);
                if (!board.isUnderAttack(square, adversary)) {
                    const piece: (Piece | undefined) = board.state[square];
                    if (!piece || (piece.color != this.color)) {
                        this.legalMoves.push(square);
                    } else if (piece.color == this.color) {
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
    moveChecks: Step[] = [
        { x: -1, y: -1 },
        { x: -1, y: 1 },
        { x: 1, y: -1 },
        { x: 1, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
        { x: 0, y: 1 }
    ];
    color: Color;
    sprite: Sprite;
    legalMoves: number[] = [];
    defendedPieces: number[] = [];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        if (color === Color.WHITE) {
            this.sprite = sprites.queen.white;
        } else {
            this.sprite = sprites.queen.black;
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
            if (Utils.xyWithingBounds([x1, y1])) {
                const square: number = Utils.toIndex(x1, y1);
                if (square > -1 && square < 64) {
                    const piece: (Piece | undefined) = board.state[square];
                    if (!piece) {
                        if (!kingInPath) {
                            this.legalMoves.push(square);
                        } else {
                            this.defendedPieces.push(square);
                        }
                    } else {
                        if ((piece instanceof King) && (piece.color != this.color)) {
                            kingInPath = true;
                        } else {
                            stopWalking = true;
                        }
                        if (piece.color != this.color && !kingInPath) {
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
    moveChecks: Step[] = [
        { x: -1, y: -1 },
        { x: -1, y: 1 },
        { x: 1, y: -1 },
        { x: 1, y: 1 }
    ];
    color: Color;
    sprite: Sprite;
    legalMoves: number[] = [];
    defendedPieces: number[] = [];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        if (color === Color.WHITE) {
            this.sprite = sprites.bishop.white;
        } else {
            this.sprite = sprites.bishop.black;
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
            if (Utils.xyWithingBounds([x1, y1])) {
                const square: number = Utils.toIndex(x1, y1);
                if (square > -1 && square < 64) {
                    const piece: (Piece | undefined) = board.state[square];
                    if (!piece) {
                        if (!kingInPath) {
                            this.legalMoves.push(square);
                        } else {
                            this.defendedPieces.push(square);
                        }
                    } else {
                        if ((piece instanceof King) && (piece.color != this.color)) {
                            kingInPath = true;
                        } else {
                            stopWalking = true;
                        }
                        if (piece.color != this.color && !kingInPath) {
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
    moveChecks: Step[] = [
        { x: -1, y: -2 },
        { x: -1, y: 2 },
        { x: -2, y: -1 },
        { x: -2, y: 1 },
        { x: 1, y: -2 },
        { x: 1, y: 2 },
        { x: 2, y: -1 },
        { x: 2, y: 1 }
    ];
    color: Color;
    sprite: Sprite;
    legalMoves: number[] = [];
    defendedPieces: number[] = [];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        if (color === Color.WHITE) {
            this.sprite = sprites.knight.white;
        } else {
            this.sprite = sprites.knight.black;
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
            if (Utils.xyWithingBounds([x1, y1])) {
                const square: number = Utils.toIndex(x1, y1);
                const piece: (Piece | undefined) = board.state[square];
                if (!piece || (piece.color != this.color)) {
                    this.legalMoves.push(square);
                } else if (piece.color == this.color) {
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
    moveChecks: Step[] = [
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
        { x: 0, y: 1 }
    ]
    private firstMove: boolean = true;
    color: Color;
    sprite: Sprite;
    legalMoves: number[] = [];
    defendedPieces: number[] = [];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        if (color === Color.WHITE) {
            this.sprite = sprites.rook.white;
        } else {
            this.sprite = sprites.rook.black;
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
            if (Utils.xyWithingBounds([x1, y1])) {
                const square: number = Utils.toIndex(x1, y1);
                if (square > -1 && square < 64) {
                    const piece: (Piece | undefined) = board.state[square];
                    if (!piece) {
                        if (!kingInPath) {
                            this.legalMoves.push(square);
                        } else {
                            this.defendedPieces.push(square);
                        }
                    } else {
                        if ((piece instanceof King) && (piece.color != this.color)) {
                            kingInPath = true;
                        } else {
                            stopWalking = true;
                        }
                        if (piece.color != this.color && !kingInPath) {
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