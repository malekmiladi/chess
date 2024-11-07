import {AttackPath} from "./arbiter.js";
import {Color, Move} from "./pieces.js";
import {CASTLE_SQUARES, CastleSide} from "./board.js";

export class Utils {
    static xToFile(x: number): string {
        return 'a' + x;
    }

    static yToRank(y: number): string {
        return (y + 1).toString();
    }

    static toXY(squareIndex: number): [number, number] {
        return [Math.floor(squareIndex / 8), squareIndex % 8];
    }

    static toSquare(x: number, y: number) {
        return x * 8 + y;
    }

    static xyWithingBounds(x: number, y: number) {
        return (-1 < x && x < 8) && (-1 < y && y < 8);
    }

    static extractXYFromElement(element: (HTMLElement | null | undefined)): [number, number] {
        const x: number = Number(element?.getAttribute("x"));
        const y: number = Number(element?.getAttribute("y"));
        return [x, y];
    }

    static thisIsPinned(square: number, pins: AttackPath[]): [isPinned: boolean, path: AttackPath] {
        for (const attack of pins) {
            if (attack.includes(square)) {
                return [true, attack];
            }
        }
        return [false, []]
    }

    static moveBlocksCheck(square: number, kChecks: AttackPath[]): boolean {
        let blockCount = kChecks.length;
        for (const path of kChecks) {
            if (path.includes(square)) {
                blockCount--;
            }
        }
        return blockCount === 0;
    }

    static getCastleRange(color: Color, side: CastleSide): [number, number] {
        switch (color) {
            case Color.BLACK:
                if (side === CastleSide.KING_SIDE) {
                    return [CASTLE_SQUARES.KS.AS_WHITE.B.KING.FROM, CASTLE_SQUARES.KS.AS_WHITE.B.ROOK.FROM];
                } else {
                    return [CASTLE_SQUARES.QS.AS_WHITE.B.ROOK.FROM, CASTLE_SQUARES.QS.AS_WHITE.B.KING.FROM];
                }
            case Color.WHITE:
                if (side === CastleSide.KING_SIDE) {
                    return [CASTLE_SQUARES.KS.AS_WHITE.W.KING.FROM, CASTLE_SQUARES.KS.AS_WHITE.W.ROOK.FROM];
                } else {
                    return [CASTLE_SQUARES.QS.AS_WHITE.W.ROOK.FROM, CASTLE_SQUARES.QS.AS_WHITE.W.KING.FROM];
                }
        }
    }

    static squareUnderAttack(territory: Set<number>[], square: number, opponent: Color): boolean {
        return territory[square].has(opponent);
    }

    static adjustSquareFor(color: Color, square: number) {
        switch (color) {
            case Color.BLACK:
                return Math.abs(square - 63);
            case Color.WHITE:
                return square;
        }
    }

    static adjustMoveFor(color: Color, move: Move) {
        switch (color) {
            case Color.BLACK:
                return { from: this.adjustSquareFor(Color.BLACK, move.from), to: this.adjustSquareFor(Color.BLACK, move.to) };
            case Color.WHITE:
                return move;
        }
    }

    static adjustLegalMoves(color: Color, moves: number[]): number[] {
        return moves.map((square: number) => {
           return color === Color.WHITE ? square : this.adjustSquareFor(Color.BLACK, square);
        });
    }

}