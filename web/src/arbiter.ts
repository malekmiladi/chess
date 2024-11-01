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

export type Pin = {
    piece: number,
    attacker: number
}

export class Arbiter {
    notifier: Notifier;

    constructor(notifier: Notifier) {
        this.notifier = notifier;
    }

    // TODO: refine the idea of line of sight for pinned pieces, rethink logic to avoid repetitive code (maybe update state,
    //       check if state is legal, if not revert back to previous state)

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

                    const slidesDiagonally = this.isDiagonalStep(step) && (isBishop || isQueen);
                    const slidesOrthogonally = this.isOrthogonalStep(step) && (isRook || isQueen);

                    if (isOpponent && (slidesDiagonally || slidesOrthogonally)) {
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

    findKingAttackingPieces(square: number, state: (Piece | undefined)[], color: Color): number[] {
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

    checkForPinnedPieceInPath(startSquare: number, step: Step, state: (Piece | undefined)[], color: Color): Pin {

        let defender = -1;
        let attacker = -1;

        const isOrthogonalStep = this.isOrthogonalStep(step);
        const isDiagonalStep = this.isDiagonalStep(step);

        let stopWalking = false;
        let square = startSquare;

        while (square > -1 && square < 64 && !stopWalking) {
            const [x, y] = Utils.toXY(square);
            const [x1, y1] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds(x1, y1)) {
                const targetSquare = Utils.toSquare(x1, y1);
                const piece = state[targetSquare];
                if (piece) {

                    const isQueen = piece instanceof Queen;
                    const isRook = piece instanceof Rook;
                    const isBishop = piece instanceof Bishop;

                    const slidesOrthogonally = isOrthogonalStep && (isRook || isQueen);
                    const slidesDiagonally = isDiagonalStep && (isQueen || isBishop);

                    if (piece.color === color) {
                        if (defender < 0) {
                            defender = targetSquare;
                        } else {
                            stopWalking = true;
                        }
                    } else {
                        if (slidesDiagonally || slidesOrthogonally) {
                            if (isQueen || isRook || isBishop) {
                                if (defender >= 0) {
                                    attacker = targetSquare;
                                }
                            }
                        }
                        stopWalking = true;
                    }
                }
                square = targetSquare;
            } else {
                stopWalking = true;
            }
        }

        return {
            piece: defender,
            attacker: attacker
        };
    }

    findPinnedPieces(square: number, state: (Piece | undefined)[], color: Color): Pin[] {
        // a bishop or a queen or a rook can each only pin 1 piece
        // this array is guaranteed to have unique pins
        let pinnedPieces: Pin[] = [];

        for (const step of MOVE_CHECKS.QUEEN) {
            const pin = this.checkForPinnedPieceInPath(square, step, state, color);
            if ((pin.piece !== -1) && (pin.attacker !== -1)) {
                pinnedPieces.push(pin);
            }
        }

        return pinnedPieces;
    }

    isOrthogonalStep(step: Step) {
        return (step.x === 0) || (step.y === 0);
    }

    isDiagonalStep(step: Step) {
        return (step.x !== 0) && (step.y !== 0);
    }

}