import {Notifier} from "./notifier.js";
import {Bishop, Color, King, Knight, Pawn, Piece, Queen, Rook, Step} from "./pieces.js";
import {Utils} from "./utils.js";


export const MOVE_CHECKS = {
    PAWN: {
        B: [
            {x: 1, y: 1},
            {x: 1, y: -1},
        ] as Step[],
        W: [
            {x: -1, y: 1},
            {x: -1, y: -1},
        ]
    },
    ROOK: [
        {x: 0, y: -1},
        {x: 0, y: 1},
        {x: -1, y: 0},
        {x: 1, y: 0},
        {x: 1, y: 1},
        {x: 1, y: -1},
        {x: -1, y: 1},
        {x: -1, y: -1},
    ],
    BISHOP: [
        {x: -1, y: -1},
        {x: -1, y: 1},
        {x: 1, y: -1},
        {x: 1, y: 1},
        {x: -1, y: 0},
        {x: 1, y: 0},
        {x: 0, y: -1},
        {x: 0, y: 1}
    ],
    KNIGHT: [
        {x: -1, y: -2},
        {x: -1, y: 2},
        {x: -2, y: -1},
        {x: -2, y: 1},
        {x: 1, y: -2},
        {x: 1, y: 2},
        {x: 2, y: -1},
        {x: 2, y: 1}
    ],
    QUEEN: [
        {x: -1, y: -1},
        {x: -1, y: 1},
        {x: 1, y: -1},
        {x: 1, y: 1},
        {x: -1, y: 0},
        {x: 1, y: 0},
        {x: 0, y: -1},
        {x: 0, y: 1}
    ],
    KING: [
        {x: -1, y: -1},
        {x: -1, y: 0},
        {x: -1, y: 1},
        {x: 1, y: -1},
        {x: 1, y: 0},
        {x: 1, y: 1},
        {x: 0, y: -1},
        {x: 0, y: 1}
    ]
}

export class Arbiter {
    notifier: Notifier;

    constructor(notifier: Notifier) {
        this.notifier = notifier;
    }

    checkForAttackingPiece([x, y]: [number, number], step: Step, attackingPieces: number[], color: Color, state: (Piece | undefined)[]) {
        const [x1, y1] = [x + step.x, y + step.y];
        if (Utils.xyWithingBounds(x1, y1)) {
            const targetSquare = Utils.toSquare(x1, y1);
            const piece: (Piece | undefined) = state[targetSquare];
            if (piece) {
                const isOpponent = piece.color !== color;
                const isPawn = piece instanceof Pawn;
                const isKnight = piece instanceof Knight;

                if (isOpponent && (isPawn || isKnight)) {
                    attackingPieces.push(targetSquare);
                }
            }
        }
    }

    walkPath(startSquare: number, step: Step, attackingPieces: number[], color: Color, state: (Piece | undefined)[]) {
        let stopWalking: boolean = false;
        let square: number = startSquare;
        while ((square < 64 && square > -1) && !stopWalking) {
            const [x, y]: [number, number] = Utils.toXY(square);
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds(x1, y1)) {
                const targetSquare: number = Utils.toSquare(x1, y1);
                const targetPiece: (Piece | undefined) = state[targetSquare];

                if (targetPiece) {
                    const isOpponent = targetPiece.color !== color;

                    const isRook = targetPiece instanceof Rook;
                    const isBishop = targetPiece instanceof Bishop;
                    const isQueen = targetPiece instanceof Queen;

                    if (isOpponent && (isRook || isQueen || isBishop)) {
                        attackingPieces.push(targetSquare);
                    } else {
                        stopWalking = true;
                    }
                }
                square = targetSquare;
            } else {
                stopWalking = true;
            }
        }
    }

    kingAttackingPieces(square: number, state: (Piece | undefined)[], color: Color): number[] {
        const attackingPieces: number[] = [];
        const pawnChecks = color === Color.BLACK ? MOVE_CHECKS.PAWN.B : MOVE_CHECKS.PAWN.W;
        const [x, y] = Utils.toXY(square);
        for (const step of [...pawnChecks, ...MOVE_CHECKS.KNIGHT]) {
            this.checkForAttackingPiece([x, y], step, attackingPieces, color, state);
        }
        for (const step of MOVE_CHECKS.QUEEN) {
            this.walkPath(square, step, attackingPieces, color, state);
        }
        return attackingPieces;
    }

}