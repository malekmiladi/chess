import { Color, Coords, Piece, Pawn, Rook, Bishop, Knight, King, Queen } from './Pieces.js'
import { Notifier } from './Notifier.js'
import { GameEvent, GameEventType } from './GameEvents.js';
export type GameState = {
    state: (Piece | null)[][]
}

export class Board {

    notifier: Notifier;
    currState: GameState;
    prevStates: GameState[];

    constructor(notifier: Notifier) {
        this.notifier = notifier;
        const initialPosition: GameState = { state: [] } as GameState;
        initialPosition.state.push([
            new Rook(0, { x: 0, y: 0 } as Coords, Color.BLACK),
            new Knight(1, { x: 1, y: 0 } as Coords, Color.BLACK),
            new Bishop(2, { x: 2, y: 0 } as Coords, Color.BLACK),
            new Queen(3, { x: 3, y: 0 } as Coords, Color.BLACK),
            new King(4, { x: 4, y: 0 } as Coords, Color.BLACK),
            new Bishop(5, { x: 5, y: 0 } as Coords, Color.BLACK),
            new Knight(6, { x: 6, y: 0 } as Coords, Color.BLACK),
            new Rook(7, { x: 7, y: 0 } as Coords, Color.BLACK),
        ])
        let pawnRow: Piece[] = [];
        for (let i: number = 0; i < 8; i++) {
            pawnRow.push(new Pawn(i + 8, { x: i, y: 1 } as Coords, Color.BLACK));
        }
        pawnRow = [];
        initialPosition.state.push(pawnRow);
        for (let i: number = 0; i < 4; i++) {
            initialPosition.state.push(new Array(8).fill(null));
        }
        for (let i: number = 0; i < 8; i++) {
            pawnRow.push(new Pawn(i + 8 + 4, { x: i, y: 6 } as Coords, Color.WHITE));
        }
        initialPosition.state.push([
            new Rook(56, { x: 0, y: 7 } as Coords, Color.WHITE),
            new Knight(57, { x: 1, y: 7 } as Coords, Color.WHITE),
            new Bishop(58, { x: 2, y: 7 } as Coords, Color.WHITE),
            new Queen(59, { x: 3, y: 7 } as Coords, Color.WHITE),
            new King(60, { x: 4, y: 7 } as Coords, Color.WHITE),
            new Bishop(61, { x: 5, y: 7 } as Coords, Color.WHITE),
            new Knight(62, { x: 6, y: 7 } as Coords, Color.WHITE),
            new Rook(63, { x: 7, y: 7 } as Coords, Color.WHITE),
        ])
        this.currState = initialPosition;
        this.prevStates = [];
    }

    movePiece(event: { type: GameEventType.MOVE_PIECE, piece: Piece, move: Coords }): void {
        this.prevStates.push({ state: Array.from(this.currState.state) } as GameState);
        event.piece.position.x = event.move.x;
        event.piece.position.y = event.move.y;
        this.currState.state[event.move.y][event.move.x] = event.piece;
    }

    takePiece(event: { type: GameEventType.TAKE_PIECE, piece: Piece }): void {
        this.currState.state[event.piece.position.y][event.piece.position.x] = null;
    }

    update(event: GameEvent): void {
        switch (event.type) {
            case GameEventType.TAKE_PIECE:
                this.takePiece(event);
                break
            case GameEventType.MOVE_PIECE:
                this.movePiece(event);
                this.notifier.notify(event);
                break;
        }
    }
}
