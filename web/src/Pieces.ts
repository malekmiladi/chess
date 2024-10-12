import { Board } from "./Board";
import { sprites, Sprite } from "./Sprites";

export enum Color {
    WHITE = 1,
    BLACK = 2
}

export type Move = {
    current: number,
    target: number
}

export type Direction = {
    diagonal: Step[],
    vertical: Step[]
}

export type Step = {
    x: number,
    y: number
}

export function toXY(curr: number): [number, number] {
    return [curr / 8, curr % 8];
}

export function toIndex(x: number, y: number) {
    return x * 8 + y;
}

export interface Piece {
    id: number;
    color: Color;
    sprite: Sprite;
    moveChecks: Direction;
    legalMoves: number[];

    generateLegalMoves(curr: number, board: Board): void;
    isLegalMove(target: number): boolean;
}

export class Pawn implements Piece {

    firstMove: boolean = true;

    moveChecks: Direction = {
        diagonal: [
            { x: -1, y: -1 },
            { x: -1, y: 1 }
        ],
        vertical: [
            { x: -1, y: 0 }
        ]
    };


    id: number;
    color: Color;
    sprite: Sprite;
    legalMoves: number[];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        this.legalMoves = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.pawn;
        } else {
            this.sprite = sprites.white.pawn;
        }
    }

    generateLegalMoves(curr: number, board: Board): void {
        const [x, y]: [number, number] = toXY(curr);
        for (const step of this.moveChecks.diagonal) {
            const index: number = toIndex(x + step.x, y + step.y);
            const piece: (Piece | undefined) = board.currState[index];
            if (piece && piece.color != this.color) {
                this.legalMoves.push(index);
            }
        }
        for (const step of this.moveChecks.vertical) {
            const index: number = toIndex(x + step.x, y + step.y);
            const piece: (Piece | undefined) = board.currState[index];
            if (!piece) {
                this.legalMoves.push(index);
            }
        }
    }

    isLegalMove(target: number): boolean {
        return this.legalMoves.includes(target);
    }
}

export class King implements Piece {
    id: number;
    moveChecks: Direction = {
        diagonal: [
            { x: -1, y: -1 },
            { x: -1, y: 1 },
            { x: 1, y: -1 },
            { x: 1, y: 1 }
        ],
        vertical: [
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 }
        ]
    };
    color: Color;
    sprite: Sprite;
    legalMoves: number[];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        this.legalMoves = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.king;
        } else {
            this.sprite = sprites.white.king;
        }
    }

    generateLegalMoves(curr: number, board: Board): void {

    }
    isLegalMove(target: number): boolean {
        return this.legalMoves.includes(target);
    }
}

export class Queen implements Piece {
    id: number;
    moveChecks: Direction = {
        diagonal: [
            { x: -1, y: -1 },
            { x: -1, y: 1 },
            { x: 1, y: -1 },
            { x: 1, y: 1 }
        ],
        vertical: [
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 }
        ]
    };
    color: Color;
    sprite: Sprite;
    legalMoves: number[];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        this.legalMoves = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.king;
        } else {
            this.sprite = sprites.white.king;
        }
    }

    walkPath(start: number, step: Step, board: Board) {
        let currIndex: number = start;
        let stopWalking: boolean = false;
        while ((currIndex < 64 || currIndex > -1) && !stopWalking) {
            const [x, y]: [number, number] = toXY(currIndex);
            const index: number = toIndex(x + step.x, y + step.y);
            const piece: (Piece | undefined) = board.currState[index];
            if (!piece) {
                this.legalMoves.push(index);
            } else {
                if (piece.color != this.color) {
                    this.legalMoves.push(index);
                }
                stopWalking = true;
            }
            currIndex = index;
        }
    }

    generateLegalMoves(curr: number, board: Board): void {
        for (const step of this.moveChecks.diagonal) {
            this.walkPath(curr, step, board);
        }
        for (const step of this.moveChecks.vertical) {
            this.walkPath(curr, step, board);
        }
    }

    isLegalMove(target: number): boolean {
        return this.legalMoves.includes(target);
    }
}

export class Bishop implements Piece {
    id: number;
    moveChecks: Direction = {
        diagonal: [
            { x: -1, y: -1 },
            { x: -1, y: 1 },
            { x: 1, y: -1 },
            { x: 1, y: 1 }
        ],
        vertical: []
    };
    color: Color;
    sprite: Sprite;
    legalMoves: number[];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        this.legalMoves = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.king;
        } else {
            this.sprite = sprites.white.king;
        }
    }

    walkPath(start: number, step: Step, board: Board) {
        let currIndex: number = start;
        let stopWalking: boolean = false;
        while ((currIndex < 64 || currIndex > -1) && !stopWalking) {
            const [x, y]: [number, number] = toXY(currIndex);
            const index: number = toIndex(x + step.x, y + step.y);
            const piece: (Piece | undefined) = board.currState[index];
            if (!piece) {
                this.legalMoves.push(index);
            } else {
                if (piece.color != this.color) {
                    this.legalMoves.push(index);
                }
                stopWalking = true;
            }
            currIndex = index;
        }
    }

    generateLegalMoves(curr: number, board: Board): void {
        for (const step of this.moveChecks.diagonal) {
            this.walkPath(curr, step, board);
        }
    }

    isLegalMove(target: number): boolean {
        return this.legalMoves.includes(target);
    }
}

export class Knight implements Piece {
    id: number;
    moveChecks: Direction = {
        diagonal: [
            { x: -1, y: -2 },
            { x: -1, y: 2 },
            { x: -2, y: -1 },
            { x: -2, y: 1 },
            { x: 1, y: -2 },
            { x: 1, y: 2 },
            { x: 2, y: -1 },
            { x: 2, y: 1 }
        ],
        vertical: []
    };
    color: Color;
    sprite: Sprite;
    legalMoves: number[];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        this.legalMoves = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.king;
        } else {
            this.sprite = sprites.white.king;
        }
    }

    generateLegalMoves(curr: number, board: Board): void {
        for (const step of this.moveChecks.diagonal) {
            const [x, y]: [number, number] = toXY(curr);
            const index: number = toIndex(x + step.x, y + step.y);
            const piece: (Piece | undefined) = board.currState[index];
            if (!piece || (piece.color != this.color)) {
                this.legalMoves.push(index);
            }  
        }
    }
    isLegalMove(target: number): boolean {
        return this.legalMoves.includes(target);
    }
}

export class Rook implements Piece {
    id: number;
    moveChecks: Direction = {
        diagonal: [],
        vertical: [
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 }
        ]
    };
    color: Color;
    sprite: Sprite;
    legalMoves: number[];

    constructor(id: number, color: Color) {
        this.id = id;
        this.color = color;
        this.legalMoves = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.king;
        } else {
            this.sprite = sprites.white.king;
        }
    }

    walkPath(start: number, step: Step, board: Board) {
        let currIndex: number = start;
        let stopWalking: boolean = false;
        while ((currIndex < 64 || currIndex > -1) && !stopWalking) {
            const [x, y]: [number, number] = toXY(currIndex);
            const index: number = toIndex(x + step.x, y + step.y);
            const piece: (Piece | undefined) = board.currState[index];
            if (!piece) {
                this.legalMoves.push(index);
            } else {
                if (piece.color != this.color) {
                    this.legalMoves.push(index);
                }
                stopWalking = true;
            }
            currIndex = index;
        }
    }

    generateLegalMoves(curr: number, board: Board): void {
        for (const step of this.moveChecks.vertical) {
            this.walkPath(curr, step, board);
        }
    }

    isLegalMove(target: number): boolean {
        return this.legalMoves.includes(target);
    }
}