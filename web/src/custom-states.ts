import {Bishop, Color, King, Knight, Pawn, Piece, Queen, Rook} from "./pieces.js";

export class CustomStates {

    public static Castles(): (Piece | undefined)[] {
        let state: (Piece | undefined)[] = []

        for (let i: number = 0; i < 63; i++) {
            state.push(undefined);
        }

        state[0] = new Rook(0, Color.BLACK);
        state[4] = new King(4, Color.BLACK);
        state[7] = new Rook(7, Color.BLACK);
        state[56] = new Rook(56, Color.WHITE);
        state[60] = new King(60, Color.WHITE);
        state[63] = new Rook(63, Color.WHITE);

        return state;
    }

    public static PawnsPromotion(): (Piece | undefined)[] {
        let state: (Piece | undefined)[] = []

        for (let i: number = 0; i < 63; i++) {
            state.push(undefined);
        }
        state[53] = new Pawn(53, Color.WHITE);
        state[8] = new Pawn(8, Color.BLACK);
        state[4] = new King(4, Color.BLACK);
        state[60] = new King(60, Color.WHITE);

        return state;
    }

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
            undefined
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
            new Rook(63, Color.WHITE)
        );
        state[53] = new Pawn(53, Color.WHITE);
        return state;
    }

}