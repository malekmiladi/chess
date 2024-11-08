import {Color, Move, Promotions} from "./pieces.js"
import {MoveOperation} from "./board";

export enum GameEventType {
    NEW_GAME,
    START_GAME,
    HIGHLIGHT_LEGAL_MOVES,
    MOVE_PIECE,
    CASTLE,
    TAKE_PIECE,
    CHECK,
    CLEAR_CHECK,
    UPDATE_DISPLAY,
    PROMOTION,
    PROMOTION_CHOICE,
    PROMOTION_SUCCESS
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
        square: number
    }
    | {
        type: GameEventType.HIGHLIGHT_LEGAL_MOVES,
        square: number
    }
    | {
        type: GameEventType.UPDATE_DISPLAY,
        op: MoveOperation
    }
    | {
        type: GameEventType.PROMOTION,
        color: Color
    }
    | {
        type: GameEventType.PROMOTION_CHOICE,
        choice: Promotions
    }
    | {
        type: GameEventType.PROMOTION_SUCCESS,
        square: number,
        choice: number,
        color: Color
    }
    | {
        type: GameEventType.CLEAR_CHECK,
        square: number
    }