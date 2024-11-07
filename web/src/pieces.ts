import {CastleSide} from "./board.js";
import {Utils} from "./utils.js";
import {AttackPath, MOVE_CHECKS} from "./arbiter.js";
import {Sprite, SPRITES} from "./sprites.js";

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

export type MoveGenOptions = {
    state: (Piece | undefined)[];
    territory: Set<number>[];
}

export interface Piece {
    readonly _id: number;
    readonly _color: Color;
    readonly _sprite: Sprite;
    readonly _moveChecks: Step[];
    _legalMoves: number[];
    _defendedPieces: number[];

    get legalMoves(): number[];
    get defendedPieces(): number[];
    get sprite(): Sprite;
    get color(): Color;
    getAttackedSquares(): number[];
    generateLegalMoves(square: number, opts: MoveGenOptions, pins: AttackPath[], kChecks: AttackPath[]): void;
    isLegalMove(to: number): boolean;
}

// TODO: rethink legal move generation cause the code is super messy

export class Pawn implements Piece {

    readonly _id: number;
    readonly _moveChecks: Step[];
    readonly _color: Color;
    readonly _sprite: Sprite;
    _legalMoves: number[] = [];
    _defendedPieces: number[] = [];

    private _firstMove: boolean = true;
    private _enPassantVulnerable: boolean = false;
    private _attackedSquares: number[] = [];
    private _enPassantChecks: Step[] = MOVE_CHECKS.PAWN.EN_PASSANT;

    constructor(id: number, color: Color) {
        this._id = id;
        this._color = color;
        if (color === Color.WHITE) {
            this._sprite = SPRITES.PAWN.W;
            this._moveChecks = MOVE_CHECKS.PAWN.W
        } else {
            this._sprite = SPRITES.PAWN.B;
            this._moveChecks = MOVE_CHECKS.PAWN.B
        }
    }

    public get id() {
        return this._id;
    }

    public get color(): Color {
        return this._color;
    }

    public get firstMove(): boolean {
        return this._firstMove;
    }

    public set firstMove(v: boolean) {
        this._firstMove = v;
    }

    public get enPassantVulnerable(): boolean {
        return this._enPassantVulnerable;
    }

    public set enPassantVulnerable(v: boolean) {
        this._enPassantVulnerable = v;
    }

    public get sprite(): Sprite {
        return this._sprite;
    }

    public get legalMoves(): number[] {
        return this._legalMoves;
    }

    public get defendedPieces(): number[] {
        return this._defendedPieces;
    }

    getAttackedSquares(): number[] {
        return this._attackedSquares.concat(this._defendedPieces);
    }

    generateLegalMoves(square: number, opts: MoveGenOptions, pins: AttackPath[], kChecks: AttackPath[]): void {
        this._legalMoves = [];
        this._defendedPieces = [];
        this._attackedSquares = [];

        const [x, y]: [number, number] = Utils.toXY(square);
        let pieceOnTheWay: boolean = false;

        const [isPinned, path] = Utils.thisIsPinned(square, pins);
        const kingInCheck = kChecks.length > 0;

        for (let i: number = 0; i < this._moveChecks.length && !pieceOnTheWay; i++) {
            const step: Step = this._moveChecks[i];
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];

            if (Utils.xyWithingBounds(x1, y1)) {
                let resolvesCheck = true;
                let resolvesPin = true;
                let resolvesCheckAndPin = true;

                const targetSquare: number = Utils.toSquare(x1, y1);
                const otherPiece: (Piece | undefined) = opts.state[targetSquare];

                if (kingInCheck) {
                    resolvesCheck = Utils.moveBlocksCheck(targetSquare, kChecks);
                }

                if (isPinned) {
                    resolvesPin = path.includes(targetSquare);
                }

                resolvesCheckAndPin = resolvesCheck && resolvesPin;

                if (resolvesCheckAndPin) {
                    const isDiagonalStep = step.y !== 0;
                    if (isDiagonalStep) {
                        this._attackedSquares.push(targetSquare);
                        if (otherPiece) {
                            const isOpponent = otherPiece.color !== this._color;
                            if (isOpponent) {
                                this._legalMoves.push(targetSquare);
                            } else {
                                this._defendedPieces.push(targetSquare);
                            }
                        }
                    } else {
                        if (!otherPiece && !pieceOnTheWay) {
                            const oneStepForward = Math.abs(step.x) === 1;
                            const twoStepsForward = Math.abs(step.x) === 2;
                            if (oneStepForward || (twoStepsForward && this.firstMove)) {
                                this._legalMoves.push(targetSquare);
                            }
                        } else {
                            pieceOnTheWay = true;
                        }
                    }
                }
            }
        }

        for (const step of this._enPassantChecks) {
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];

            if (Utils.xyWithingBounds(x1, y1)) {
                const targetSquare: number = Utils.toSquare(x1, y1);
                const otherPiece: (Piece | undefined) = opts.state[targetSquare];

                if (otherPiece) {
                    const isOpponent = otherPiece.color !== this.color;
                    const isPawn = otherPiece instanceof Pawn;
                    if (isOpponent && isPawn && otherPiece.enPassantVulnerable) {
                        const xIncrement = this.color === Color.BLACK ? 1 : -1;
                        const enPassantSquare = Utils.toSquare(x1 + xIncrement, y1);
                        this._legalMoves.push(enPassantSquare);
                    }
                }
            }
        }
    }

    isLegalMove(to: number): boolean {
        return this._legalMoves.includes(to);
    }

}

export class King implements Piece {
    readonly _id: number;
    readonly _moveChecks: Step[];
    readonly _color: Color;
    readonly _sprite: Sprite;
    _legalMoves: number[] = [];
    _defendedPieces: number[] = [];

    private _firstMove: boolean = true;
    private _surroundingSquares: number[] = []

    constructor(id: number, color: Color) {
        this._id = id;
        this._color = color;
        this._sprite = color === Color.WHITE ? SPRITES.KING.W : SPRITES.KING.B;
        this._moveChecks = MOVE_CHECKS.KING;
    }

    public get id() {
        return this._id;
    }

    public get sprite() {
        return this._sprite;
    }

    public get color() {
        return this._color;
    }

    public get legalMoves() {
        return this._legalMoves;
    }

    public get defendedPieces() {
        return this._defendedPieces;
    }

    public get firstMove(): boolean {
        return this._firstMove;
    }

    public set firstMove(v: boolean) {
        this._firstMove = v;
    }

    getAttackedSquares(): number[] {
        return this._legalMoves.concat(this._defendedPieces);
    }

    getSurroundingSquares(square: number): number[] {
        this._surroundingSquares = [];
        const [x, y]: [number, number] = Utils.toXY(square);
        for (const step of this._moveChecks) {
            const [x1, y1] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds(x1, y1)) {
                this._surroundingSquares.push(Utils.toSquare(x1, y1));
            }
        }
        return this._surroundingSquares;
    }

    getCastleSquare(rook: (Rook | undefined), opts: MoveGenOptions, start: number, end: number, ks: boolean): number {
        let pathObstructed: boolean = false;
        const opponent = this._color === Color.WHITE ? Color.BLACK : Color.WHITE;

        if (rook?.firstMove) {
            let i: number = start + 1;
            while (i < end && !pathObstructed) {
                let pathUnderAttack: boolean = Utils.squareUnderAttack(opts.territory, i, opponent);
                if ((opts.state[i] !== undefined) || pathUnderAttack) {
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

    generateCastleMoves(opts: MoveGenOptions): number[] {
        let castleMoves: number[] = [];

        let [ksStart, ksEnd]: [number, number] = [-1, -1];
        let [qsStart, qsEnd]: [number, number] = [-1, -1];

        if (this._firstMove) {

            [ksStart, ksEnd] = Utils.getCastleRange(this._color, CastleSide.KING_SIDE);
            [qsStart, qsEnd] = Utils.getCastleRange(this._color, CastleSide.QUEEN_SIDE);

            const ksRook: (Piece | undefined) = opts.state[ksEnd];
            const ksCastleSquare = this.getCastleSquare(<Rook>ksRook, opts, ksStart, ksEnd, true);
            if (ksCastleSquare !== -1) {
                castleMoves.push(ksCastleSquare);
            }

            const qsRook: (Piece | undefined) = opts.state[qsStart];
            const qsCastleSquare = this.getCastleSquare(<Rook>qsRook, opts, qsStart, qsEnd, false);
            if (qsCastleSquare !== -1) {
                castleMoves.push(qsCastleSquare);
            }
        }

        return castleMoves;
    }

    generateLegalMoves(square: number, opts: MoveGenOptions, _: AttackPath[], kChecks: AttackPath[]): void {
        this._legalMoves = [];
        this._defendedPieces = [];
        this._surroundingSquares = [];
        const opponent: Color = this.color === Color.BLACK ? Color.WHITE : Color.BLACK;
        const [x, y]: [number, number] = Utils.toXY(square);

        for (const step of this._moveChecks) {
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds(x1, y1)) {
                const square: number = Utils.toSquare(x1, y1);
                this._surroundingSquares.push(square);
                if (!Utils.squareUnderAttack(opts.territory, square, opponent)) {
                    const piece: (Piece | undefined) = opts.state[square];
                    if (!piece || (piece.color !== this.color)) {
                        this._legalMoves.push(square);
                    } else if (piece.color === this.color) {
                        this.defendedPieces.push(square);
                    }
                }
            }
        }
        const kingInCheck = kChecks.length > 0;
        if (!kingInCheck) {
            const castles: number[] = this.generateCastleMoves(opts);
            this._legalMoves = this._legalMoves.concat(castles);
        }
    }

    isLegalMove(to: number): boolean {
        return this._legalMoves.includes(to);
    }
}

export class Queen implements Piece {
    readonly _id: number;
    readonly _moveChecks: Step[];
    readonly _color: Color;
    readonly _sprite: Sprite;
    _legalMoves: number[] = [];
    _defendedPieces: number[] = [];

    constructor(id: number, color: Color) {
        this._id = id;
        this._color = color;
        this._sprite = color === Color.WHITE ? SPRITES.QUEEN.W : SPRITES.QUEEN.B;
        this._moveChecks = MOVE_CHECKS.QUEEN;
    }

    public get id() {
        return this._id;
    }

    public get sprite() {
        return this._sprite;
    }

    public get color() {
        return this._color;
    }

    public get legalMoves() {
        return this._legalMoves;
    }

    public get defendedPieces() {
        return this._defendedPieces;
    }

    getAttackedSquares(): number[] {
        return this._legalMoves.concat(this._defendedPieces);
    }

    walkPath(startSquare: number, step: Step, state: (Piece | undefined)[], pins: AttackPath[], kChecks: AttackPath[]) {
        let stopWalking: boolean = false;
        let squareIndex: number = startSquare;
        let kingInPath: boolean = false;

        const [isPinned, path] = Utils.thisIsPinned(startSquare, pins);
        const kingInCheck = kChecks.length > 0;

        while ((squareIndex < 64 && squareIndex > -1) && !stopWalking) {
            const [x, y]: [number, number] = Utils.toXY(squareIndex);
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds(x1, y1)) {
                const square: number = Utils.toSquare(x1, y1);
                const piece: (Piece | undefined) = state[square];

                let resolvesCheck = true;
                let resolvesPin = true;
                let resolvesCheckAndPin = true;

                if (kingInCheck) {
                    resolvesCheck = Utils.moveBlocksCheck(square, kChecks);
                }
                if (isPinned) {
                    resolvesPin = path.includes(square);
                }

                resolvesCheckAndPin = resolvesCheck && resolvesPin;

                if (!piece) {
                    if (!kingInPath) {
                        if (resolvesCheckAndPin) {
                            this._legalMoves.push(square);
                        }
                    } else {
                        this._defendedPieces.push(square);
                    }
                } else {
                    const isKing = piece instanceof King;
                    const isOpponent = piece.color !== this._color;
                    if (isOpponent && isKing) {
                        kingInPath = true;
                    } else {
                        stopWalking = true;
                    }
                    if (isOpponent && !kingInPath) {
                        if (resolvesCheckAndPin) {
                            this._legalMoves.push(square);
                        }
                    } else {
                        this._defendedPieces.push(square);
                    }
                }

                squareIndex = square;
            } else {
                stopWalking = true;
            }
        }
    }

    generateLegalMoves(square: number, opts: MoveGenOptions, pins: AttackPath[], kChecks: AttackPath[]): void {
        this._legalMoves = [];
        this._defendedPieces = [];
        for (const step of this._moveChecks) {
            this.walkPath(square, step, opts.state, pins, kChecks);
        }
    }

    isLegalMove(to: number): boolean {
        return this._legalMoves.includes(to);
    }
}

export class Bishop implements Piece {
    readonly _id: number;
    readonly _moveChecks: Step[];
    readonly _color: Color;
    readonly _sprite: Sprite;
    _legalMoves: number[] = [];
    _defendedPieces: number[] = [];

    constructor(id: number, color: Color) {
        this._id = id;
        this._color = color;
        this._sprite = color === Color.WHITE ? SPRITES.BISHOP.W : SPRITES.BISHOP.B;
        this._moveChecks = MOVE_CHECKS.BISHOP;
    }

    public get id() {
        return this._id;
    }

    public get sprite() {
        return this._sprite;
    }

    public get color() {
        return this._color;
    }

    public get legalMoves() {
        return this._legalMoves;
    }

    public get defendedPieces() {
        return this._defendedPieces;
    }

    getAttackedSquares(): number[] {
        return this._legalMoves.concat(this._defendedPieces);
    }

    walkPath(startSquare: number, step: Step, state: (Piece | undefined)[], pins: AttackPath[], kChecks: AttackPath[]) {
        let stopWalking: boolean = false;
        let squareIndex: number = startSquare;
        let kingInPath: boolean = false;

        const [isPinned, path] = Utils.thisIsPinned(startSquare, pins);
        const kingInCheck = kChecks.length > 0;

        while ((squareIndex < 64 && squareIndex > -1) && !stopWalking) {
            const [x, y]: [number, number] = Utils.toXY(squareIndex);
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds(x1, y1)) {
                const square: number = Utils.toSquare(x1, y1);
                const piece: (Piece | undefined) = state[square];

                let resolvesCheck = true;
                let resolvesPin = true;
                let resolvesCheckAndPin = true;

                if (kingInCheck) {
                    resolvesCheck = Utils.moveBlocksCheck(square, kChecks);
                }
                if (isPinned) {
                    resolvesPin = path.includes(square);
                }

                resolvesCheckAndPin = resolvesCheck && resolvesPin;

                if (!piece) {
                    if (!kingInPath) {
                        if (resolvesCheckAndPin) {
                            this._legalMoves.push(square);
                        }
                    } else {
                        this.defendedPieces.push(square);
                    }
                } else {
                    const isKing = piece instanceof King;
                    const isOpponent = piece.color !== this._color;
                    if (isOpponent && isKing) {
                        kingInPath = true;
                    } else {
                        stopWalking = true;
                    }
                    if (isOpponent && !kingInPath) {
                        if (resolvesCheckAndPin) {
                            this._legalMoves.push(square);
                        }
                    } else {
                        this.defendedPieces.push(square);
                    }
                }

                squareIndex = square;
            } else {
                stopWalking = true;
            }
        }
    }

    generateLegalMoves(square: number, opts: MoveGenOptions, pins: AttackPath[], kChecks: AttackPath[]): void {
        this._legalMoves = [];
        this._defendedPieces = [];
        for (const step of this._moveChecks) {
            this.walkPath(square, step, opts.state, pins, kChecks);
        }
    }

    isLegalMove(to: number): boolean {
        return this._legalMoves.includes(to);
    }
}

export class Knight implements Piece {
    readonly _id: number;
    readonly _moveChecks: Step[];
    readonly _color: Color;
    readonly _sprite: Sprite;
    _legalMoves: number[] = [];
    _defendedPieces: number[] = [];

    constructor(id: number, color: Color) {
        this._id = id;
        this._color = color;
        this._sprite = color === Color.WHITE ? SPRITES.KNIGHT.W : SPRITES.KNIGHT.B;
        this._moveChecks = MOVE_CHECKS.KNIGHT;
    }

    public get id() {
        return this._id;
    }

    public get sprite() {
        return this._sprite;
    }

    public get color() {
        return this._color;
    }

    public get legalMoves() {
        return this._legalMoves;
    }

    public get defendedPieces() {
        return this._defendedPieces;
    }

    getAttackedSquares(): number[] {
        return this._legalMoves.concat(this._defendedPieces);
    }

    generateLegalMoves(square: number, opts: MoveGenOptions, pins: AttackPath[], kChecks: AttackPath[]): void {
        this._legalMoves = [];
        this._defendedPieces = [];

        const [isPinned, path] = Utils.thisIsPinned(square, pins);
        const kingInCheck = kChecks.length > 0;

        for (const step of this._moveChecks) {
            const [x, y]: [number, number] = Utils.toXY(square);
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds(x1, y1)) {
                const square: number = Utils.toSquare(x1, y1);
                const piece: (Piece | undefined) = opts.state[square];

                let resolvesCheck = true;
                let resolvesPin = true;
                let resolvesCheckAndPin = true;

                if (kingInCheck) {
                    resolvesCheck = Utils.moveBlocksCheck(square, kChecks);
                }
                if (isPinned) {
                    resolvesPin = path.includes(square);
                }

                resolvesCheckAndPin = resolvesCheck && resolvesPin;

                if (resolvesCheckAndPin) {
                    if (!piece || (piece.color !== this._color)) {
                        this._legalMoves.push(square);
                    } else if (piece.color === this._color) {
                        this._defendedPieces.push(square);
                    }
                }
            }
        }
    }

    isLegalMove(to: number): boolean {
        return this._legalMoves.includes(to);
    }
}

export class Rook implements Piece {
    readonly _id: number;
    readonly _moveChecks: Step[];
    readonly _color: Color;
    readonly _sprite: Sprite;
    _legalMoves: number[] = [];
    _defendedPieces: number[] = [];

    private _firstMove: boolean = true;

    constructor(id: number, color: Color) {
        this._id = id;
        this._color = color;
        this._sprite = color === Color.WHITE ? SPRITES.ROOK.W : SPRITES.ROOK.B;
        this._moveChecks = MOVE_CHECKS.ROOK;
    }

    public get id() {
        return this._id;
    }

    public get color() {
        return this._color;
    }

    public get legalMoves() {
        return this._legalMoves;
    }

    public get sprite() {
        return this._sprite;
    }

    public get defendedPieces() {
        return this._defendedPieces;
    }

    public get firstMove() {
        return this._firstMove;
    }

    public set firstMove(v: boolean) {
        this._firstMove = v;
    }

    getAttackedSquares(): number[] {
        return this._legalMoves.concat(this._defendedPieces);
    }

    walkPath(startSquare: number, step: Step, state: (Piece | undefined)[], pins: AttackPath[], kChecks: AttackPath[]) {
        let stopWalking: boolean = false;
        let squareIndex: number = startSquare;
        let kingInPath: boolean = false;

        const [isPinned, path] = Utils.thisIsPinned(startSquare, pins);
        const kingInCheck = kChecks.length > 0;

        while ((squareIndex < 64 && squareIndex > -1) && !stopWalking) {
            const [x, y]: [number, number] = Utils.toXY(squareIndex);
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];

            if (Utils.xyWithingBounds(x1, y1)) {
                const square: number = Utils.toSquare(x1, y1);
                const piece: (Piece | undefined) = state[square];

                let resolvesCheck = true;
                let resolvesPin = true;
                let resolvesCheckAndPin = true;

                if (kingInCheck) {
                    resolvesCheck = Utils.moveBlocksCheck(square, kChecks);
                }
                if (isPinned) {
                    resolvesPin = path.includes(square);
                }

                resolvesCheckAndPin = resolvesCheck && resolvesPin;

                if (!piece) {
                    if (!kingInPath) {
                        if (resolvesCheckAndPin) {
                            this._legalMoves.push(square);
                        }
                    } else {
                        this._defendedPieces.push(square);
                    }
                } else {
                    const isKing = piece instanceof King;
                    const isOpponent = piece.color !== this.color;

                    if (isOpponent && isKing) {
                        kingInPath = true;
                    } else {
                        stopWalking = true;
                    }
                    if (isOpponent && !kingInPath) {
                        if (resolvesCheckAndPin) {
                            this._legalMoves.push(square);
                        }
                    } else {
                        this._defendedPieces.push(square);
                    }
                }

                squareIndex = square;
            } else {
                stopWalking = true;
            }
        }
    }

    generateLegalMoves(square: number, opts: MoveGenOptions, pins: AttackPath[], kChecks: AttackPath[]): void {
        this._legalMoves = [];
        this._defendedPieces = [];
        for (const step of this._moveChecks) {
            this.walkPath(square, step, opts.state, pins, kChecks);
        }
    }

    isLegalMove(to: number): boolean {
        return this._legalMoves.includes(to);
    }
}