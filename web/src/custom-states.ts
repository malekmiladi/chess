import {Bishop, Color, King, Knight, Pawn, Piece, Queen, Rook} from "./pieces.js";

export class CustomStates {
    public static KingsQueenKnight(): (Piece | undefined)[] {
        let state: (Piece | undefined)[] = []
        state.push(
            undefined,
            undefined,
            undefined,
            undefined,
            new King(4, Color.BLACK),
            undefined,
            undefined,
            undefined,
        );
        for (let i: number = 0; i < 48; i++) {
            state.push(undefined);
        }
        state.push(
            undefined,
            new Knight(57, Color.WHITE),
            undefined,
            new Queen(59, Color.WHITE),
            new King(60, Color.WHITE),
            undefined,
            undefined,
            undefined,
        );
        return state;
    }

    public static PinScenario(): (Piece | undefined)[] {
        let state: (Piece | undefined)[] = []
        state.push(
            undefined,
            undefined,
            new Bishop(2, Color.BLACK),
            new Queen(3, Color.BLACK),
            new King(4, Color.BLACK),
            undefined,
            undefined,
            undefined,
        );
        for (let i: number = 0; i < 48; i++) {
            state.push(undefined);
        }
        state.push(
            undefined,
            new Knight(57, Color.WHITE),
            undefined,
            new Queen(59, Color.WHITE),
            new King(60, Color.WHITE),
            undefined,
            undefined,
            undefined,
        );
        return state;
    }
}