import { sprites } from "./Sprites";
var Color;
(function (Color) {
    Color[Color["WHITE"] = 1] = "WHITE";
    Color[Color["BLACK"] = 2] = "BLACK";
})(Color || (Color = {}));
export class Pawn {
    constructor(id, position, color) {
        this.id = id;
        this.position = position;
        this.color = color;
        this.legalMoves = [];
        this.prevPositions = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.pawn;
        }
        else {
            this.sprite = sprites.white.pawn;
        }
    }
    move() {
        this.prevPositions.push(this.position);
        //notifyUpdater(this);
        this.generateLegalMoves();
    }
    generateLegalMoves() {
    }
    isLegalMove() {
        return true;
    }
}
export class King {
    constructor(id, position, color) {
        this.id = id;
        this.position = position;
        this.color = color;
        this.legalMoves = [];
        this.prevPositions = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.king;
        }
        else {
            this.sprite = sprites.white.king;
        }
    }
    move() {
        this.prevPositions.push(this.position);
        //notifyUpdater(this);
        this.generateLegalMoves();
    }
    generateLegalMoves() {
    }
    isLegalMove() {
        return true;
    }
}
export class Queen {
    constructor(id, position, color) {
        this.id = id;
        this.position = position;
        this.color = color;
        this.legalMoves = [];
        this.prevPositions = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.king;
        }
        else {
            this.sprite = sprites.white.king;
        }
    }
    move() {
        this.prevPositions.push(this.position);
        //notifyUpdater(this);
        this.generateLegalMoves();
    }
    generateLegalMoves() {
    }
    isLegalMove() {
        return true;
    }
}
export class Bishop {
    constructor(id, position, color) {
        this.id = id;
        this.position = position;
        this.color = color;
        this.legalMoves = [];
        this.prevPositions = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.king;
        }
        else {
            this.sprite = sprites.white.king;
        }
    }
    move() {
        this.prevPositions.push(this.position);
        //notifyUpdater(this);
        this.generateLegalMoves();
    }
    generateLegalMoves() {
    }
    isLegalMove() {
        return true;
    }
}
export class Knight {
    constructor(id, position, color) {
        this.id = id;
        this.position = position;
        this.color = color;
        this.legalMoves = [];
        this.prevPositions = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.king;
        }
        else {
            this.sprite = sprites.white.king;
        }
    }
    move() {
        this.prevPositions.push(this.position);
        //notifyUpdater(this);
        this.generateLegalMoves();
    }
    generateLegalMoves() {
    }
    isLegalMove() {
        return true;
    }
}
export class Rook {
    constructor(id, position, color) {
        this.id = id;
        this.position = position;
        this.color = color;
        this.legalMoves = [];
        this.prevPositions = [];
        if (color === Color.WHITE) {
            this.sprite = sprites.black.king;
        }
        else {
            this.sprite = sprites.white.king;
        }
    }
    move() {
        this.prevPositions.push(this.position);
        //notifyUpdater(this);
        this.generateLegalMoves();
    }
    generateLegalMoves() {
    }
    isLegalMove() {
        return true;
    }
}
