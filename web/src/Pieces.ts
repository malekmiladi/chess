import { GameEventType } from "./GameEvents";
import { sprites, Sprite } from "./Sprites";

export enum Color {

    WHITE = 1,
    BLACK = 2

}

export type Coords = {

    x: number,
    y: number

}

export interface Piece {

    id: number;
    position: Coords;
    color: Color;
    legalMoves: Coords[];
    sprite: Sprite;
    prevPositions: Coords[];

    move(): void;
    generateLegalMoves(): void;
    isLegalMove(): boolean;

}

export class Pawn implements Piece {

    id: number;
    position: Coords;
    color: Color;
    legalMoves: Coords[];
    sprite: Sprite;
    prevPositions: Coords[];

    constructor(id: number, position: Coords, color: Color) {
        this.id = id;
        this.position = position;
        this.color = color;
        this.legalMoves = [];
        this.prevPositions = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.pawn;
        } else {
            this.sprite = sprites.white.pawn;
        }
    }

    move(): void {
        this.prevPositions.push(this.position);
        //notifyUpdater(this);
        this.generateLegalMoves();
    }
    generateLegalMoves(): void {

    }
    isLegalMove(): boolean {
        return true;
    }

}

export class King implements Piece {

    id: number;
    position: Coords;
    color: Color;
    legalMoves: Coords[];
    sprite: Sprite;
    prevPositions: Coords[];

    constructor(id: number, position: Coords, color: Color) {
        this.id = id;
        this.position = position;
        this.color = color;
        this.legalMoves = [];
        this.prevPositions = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.king;
        } else {
            this.sprite = sprites.white.king;
        }
    }

    move(): void {
        this.prevPositions.push(this.position);
        //notifyUpdater(this);
        this.generateLegalMoves();
    }
    generateLegalMoves(): void {

    }
    isLegalMove(): boolean {
        return true;
    }

}

export class Queen implements Piece {

    id: number;
    position: Coords;
    color: Color;
    legalMoves: Coords[];
    sprite: Sprite;
    prevPositions: Coords[];

    constructor(id: number, position: Coords, color: Color) {
        this.id = id;
        this.position = position;
        this.color = color;
        this.legalMoves = [];
        this.prevPositions = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.king;
        } else {
            this.sprite = sprites.white.king;
        }
    }

    move(): void {
        this.prevPositions.push(this.position);
        //notifyUpdater(this);
        this.generateLegalMoves();
    }
    generateLegalMoves(): void {

    }
    isLegalMove(): boolean {
        return true;
    }

}

export class Bishop implements Piece {

    id: number;
    position: Coords;
    color: Color;
    legalMoves: Coords[];
    sprite: Sprite;
    prevPositions: Coords[];

    constructor(id: number, position: Coords, color: Color) {
        this.id = id;
        this.position = position;
        this.color = color;
        this.legalMoves = [];
        this.prevPositions = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.king;
        } else {
            this.sprite = sprites.white.king;
        }
    }

    move(): void {
        this.prevPositions.push(this.position);
        //notifyUpdater(this);
        this.generateLegalMoves();
    }
    generateLegalMoves(): void {

    }
    isLegalMove(): boolean {
        return true;
    }

}

export class Knight implements Piece {

    id: number;
    position: Coords;
    color: Color;
    legalMoves: Coords[];
    sprite: Sprite;
    prevPositions: Coords[];

    constructor(id: number, position: Coords, color: Color) {
        this.id = id;
        this.position = position;
        this.color = color;
        this.legalMoves = [];
        this.prevPositions = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.king;
        } else {
            this.sprite = sprites.white.king;
        }
    }

    move(): void {
        this.prevPositions.push(this.position);
        //notifyUpdater(this);
        this.generateLegalMoves();
    }
    generateLegalMoves(): void {

    }
    isLegalMove(): boolean {
        return true;
    }

}

export class Rook implements Piece {

    id: number;
    position: Coords;
    color: Color;
    legalMoves: Coords[];
    sprite: Sprite;
    prevPositions: Coords[];

    constructor(id: number, position: Coords, color: Color) {
        this.id = id;
        this.position = position;
        this.color = color;
        this.legalMoves = [];
        this.prevPositions = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.king;
        } else {
            this.sprite = sprites.white.king;
        }
    }

    move(): void {
        this.prevPositions.push(this.position);
        //notifyUpdater(this);
        this.generateLegalMoves();
    }
    generateLegalMoves(): void {

    }
    isLegalMove(): boolean {
        return true;
    }

}