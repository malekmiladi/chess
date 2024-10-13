import { Board } from "./Board.js";
import { sprites, Sprite } from "./Sprites.js";

export enum Color {
    WHITE = 1,
    BLACK = 2
}

export type Move = {
    current: number,
    target: number
}

export type Step = {
    x: number,
    y: number
}

export function toXY(curr: number): [number, number] {
    return [Math.floor(curr / 8), curr % 8];
}

export function toIndex(x: number, y: number) {
    return x * 8 + y;
}

export function xyWithingBounds(xy: [number, number]) {
    const [x, y]: [number, number] = xy;
    return (-1 < x && x < 8) && (-1 < y && y < 8);
}
export interface Piece {
    id: number;
    color: Color;
    sprite: Sprite;
    moveChecks: Step[];
    legalMoves: number[];
    defendedPieces: number[];

    getAttackedSquares(): number[];
    generateLegalMoves(curr: number, board: Board): void;
    isLegalMove(target: number): boolean;
}

export class Pawn implements Piece {
    firstMove: boolean = true;
    moveChecks: Step[];

    id: number;
    color: Color;
    sprite: Sprite;
    legalMoves: number[] = [];
    defendedPieces: number[] = [];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        if (color === Color.WHITE) {
            this.sprite = sprites.pawn.black;

            this.moveChecks = [
                { x: -1, y: -1 },
                { x: -1, y: 1 },
                { x: -1, y: 0 }
            ]
        } else {
            this.sprite = sprites.pawn.white;
            this.moveChecks = [
                { x: 1, y: -1 },
                { x: 1, y: 1 },
                { x: 1, y: 0 }
            ]
        }
    }

    getAttackedSquares(): number[] {
        return this.legalMoves.concat(this.defendedPieces);
    }

    generateLegalMoves(curr: number, board: Board): void {
        const [x, y]: [number, number] = toXY(curr);
        for (const step of this.moveChecks) {
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (xyWithingBounds([x1, y1])) {
                const index: number = toIndex(x1, y1);
                const piece: (Piece | undefined) = board.currState[index];
                if (step.y != 0) {
                    if (piece) {
                        if (piece.color != this.color) {
                            this.legalMoves.push(index);
                        } else {
                            this.defendedPieces.push(index);
                        }
                    }
                } else {
                    if (!piece) {
                        this.legalMoves.push(index);
                    }
                }
            }
        }
    }

    isLegalMove(target: number): boolean {
        return this.legalMoves.includes(target);
    }

}

export class King implements Piece {
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
            this.sprite = sprites.king.black;
        } else {
            this.sprite = sprites.king.white;
        }
    }

    getAttackedSquares(): number[] {
        return this.legalMoves.concat(this.defendedPieces);
    }

    generateLegalMoves(curr: number, board: Board): void {
        const adversary: Color = this.color == Color.BLACK ? Color.WHITE : Color.BLACK;
        const attackedSquares: boolean[] = board.getAttackedSquares(adversary);
        const [x, y]: [number, number] = toXY(curr);
        for (const step of this.moveChecks) {
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (xyWithingBounds([x1, y1])) {
                const index: number = toIndex(x1, y1);
                if (!attackedSquares[index]) {
                    const piece: (Piece | undefined) = board.currState[index];
                    if (!piece || (piece.color != this.color)) {
                        this.legalMoves.push(index);
                    } else if (piece.color == this.color) {
                        this.defendedPieces.push(index);
                    }
                }
            }
        }
    }

    isLegalMove(target: number): boolean {
        return this.legalMoves.includes(target);
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
            this.sprite = sprites.queen.black;
        } else {
            this.sprite = sprites.queen.white;
        }
    }

    getAttackedSquares(): number[] {
        return this.legalMoves.concat(this.defendedPieces);
    }

    walkPath(start: number, step: Step, board: Board) {
        let stopWalking: boolean = false;
        let currIndex: number = start;
        const [x, y]: [number, number] = toXY(currIndex);
        while ((currIndex < 64 && currIndex > -1) && !stopWalking) {
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (xyWithingBounds([x1, y1])) {
                const index: number = toIndex(x1, y1);
                if (index > -1 && index < 64) {
                    const piece: (Piece | undefined) = board.currState[index];
                    if (!piece) {
                        this.legalMoves.push(index);
                    } else {
                        if (piece.color != this.color) {
                            this.legalMoves.push(index);
                        } else {
                            this.defendedPieces.push(index);
                        }
                        stopWalking = true;
                    }
                    currIndex = index;
                } else {
                    stopWalking = true;
                }
            } else {
                stopWalking = true;
            }
        }
    }

    generateLegalMoves(curr: number, board: Board): void {
        for (const step of this.moveChecks) {
            this.walkPath(curr, step, board);
        }
    }

    isLegalMove(target: number): boolean {
        return this.legalMoves.includes(target);
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
            this.sprite = sprites.bishop.black;
        } else {
            this.sprite = sprites.bishop.white;
        }
    }

    getAttackedSquares(): number[] {
        return this.legalMoves.concat(this.defendedPieces);
    }
    walkPath(start: number, step: Step, board: Board) {
        let stopWalking: boolean = false;
        let currIndex: number = start;
        const [x, y]: [number, number] = toXY(currIndex);
        while ((currIndex < 64 && currIndex > -1) && !stopWalking) {
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (xyWithingBounds([x1, y1])) {
                const index: number = toIndex(x1, y1);
                if (index > -1 && index < 64) {
                    const piece: (Piece | undefined) = board.currState[index];
                    if (!piece) {
                        this.legalMoves.push(index);
                    } else {
                        if (piece.color != this.color) {
                            this.legalMoves.push(index);
                        } else {
                            this.defendedPieces.push(index);
                        }
                        stopWalking = true;
                    }
                    currIndex = index;
                } else {
                    stopWalking = true;
                }
            } else {
                stopWalking = true;
            }
        }
    }

    generateLegalMoves(curr: number, board: Board): void {
        for (const step of this.moveChecks) {
            this.walkPath(curr, step, board);
        }
    }

    isLegalMove(target: number): boolean {
        return this.legalMoves.includes(target);
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
            this.sprite = sprites.knight.black;
        } else {
            this.sprite = sprites.knight.white;
        }
    }

    getAttackedSquares(): number[] {
        return this.legalMoves.concat(this.defendedPieces);
    }

    generateLegalMoves(curr: number, board: Board): void {
        for (const step of this.moveChecks) {
            const [x, y]: [number, number] = toXY(curr);
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (xyWithingBounds([x1, y1])) {
                const index: number = toIndex(x1, y1);
                const piece: (Piece | undefined) = board.currState[index];
                if (!piece || (piece.color != this.color)) {
                    this.legalMoves.push(index);
                } else if (piece.color == this.color) {
                    this.defendedPieces.push(index);
                }
            }
        }
    }

    isLegalMove(target: number): boolean {
        return this.legalMoves.includes(target);
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
    color: Color;
    sprite: Sprite;
    legalMoves: number[] = [];
    defendedPieces: number[] = [];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        if (color === Color.WHITE) {
            this.sprite = sprites.rook.black;
        } else {
            this.sprite = sprites.rook.white;
        }
    }

    getAttackedSquares(): number[] {
        return this.legalMoves.concat(this.defendedPieces);
    }

    walkPath(start: number, step: Step, board: Board) {
        let stopWalking: boolean = false;
        let currIndex: number = start;
        const [x, y]: [number, number] = toXY(currIndex);
        while ((currIndex < 64 && currIndex > -1) && !stopWalking) {
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (xyWithingBounds([x1, y1])) {
                const index: number = toIndex(x1, y1);
                if (index > -1 && index < 64) {
                    const piece: (Piece | undefined) = board.currState[index];
                    if (!piece) {
                        this.legalMoves.push(index);
                    } else {
                        if (piece.color != this.color) {
                            this.legalMoves.push(index);
                        } else {
                            this.defendedPieces.push(index);
                        }
                        stopWalking = true;
                    }
                    currIndex = index;
                } else {
                    stopWalking = true;
                }
            } else {
                stopWalking = true;
            }
        }
    }

    generateLegalMoves(curr: number, board: Board): void {
        for (const step of this.moveChecks) {
            this.walkPath(curr, step, board);
        }
    }

    isLegalMove(target: number): boolean {
        return this.legalMoves.includes(target);
    }
}