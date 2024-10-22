import { Color, Move } from "./pieces.js"

export enum GameEventType {
    NEW_GAME,
    START_GAME,
    HIGHLIGHT_LEGAL_MOVES,
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
        type: GameEventType.CHECK,
        player: Color
    }
    | {
        type: GameEventType.HIGHLIGHT_LEGAL_MOVES,
        square: number
    }