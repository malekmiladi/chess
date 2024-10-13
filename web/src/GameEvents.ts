import { Color, Move } from "./Pieces.js"

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
        move: Move
    }
    | {
        type: GameEventType.TAKE_PIECE,
        target: number
    }
    | {
        type: GameEventType.CHECK,
        player: Color
    }