import { Coords, Piece, Color } from "./Pieces"

export enum GameEventType {
    NEW_GAME,
    START_GAME,
    MOVE_PIECE,
    TAKE_PIECE,
    CHECK
}

export type GameEvent = 
    | {
        type: GameEventType.NEW_GAME
    }
    | {
        type: GameEventType.START_GAME
    }
    | {
        type: GameEventType.MOVE_PIECE,
        piece: Piece,
        move: Coords
    }
    | {
        type: GameEventType.TAKE_PIECE,
        piece: Piece
    }
    | {
        type: GameEventType.CHECK,
        player: Color
    }
