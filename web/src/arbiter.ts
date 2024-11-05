import {Notifier} from "./notifier.js";
import {Bishop, Color, King, Knight, Pawn, Piece, Queen, Rook, Step} from "./pieces.js";
import {Utils} from "./utils.js";

export const MOVE_CHECKS = {
    PAWN: {
        CHECK: {
            B: [
                {x: 1, y: 1},
                {x: 1, y: -1}
            ],
            W: [
                {x: -1, y: 1},
                {x: -1, y: -1}
            ]
        },
        B: [
            {x: 1, y: 1},
            {x: 1, y: -1},
            {x: 1, y: 0},
            {x: 2, y: 0},
        ] as Step[],
        W: [
            {x: -1, y: 1},
            {x: -1, y: -1},
            {x: -1, y: 0},
            {x: -2, y: 0},
        ]
    },
    ROOK: [
        {x: 0, y: -1},
        {x: 0, y: 1},
        {x: -1, y: 0},
        {x: 1, y: 0},
    ],
    BISHOP: [
        {x: -1, y: -1},
        {x: -1, y: 1},
        {x: 1, y: -1},
        {x: 1, y: 1}
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

export type AttackPath = number[];

export class Arbiter {
    notifier: Notifier;
    moves: number;
    threeFoldMoves: number;
    the50ruleMoves: number;
    wKInCheck: boolean;
    bKInCheck: boolean;

    constructor(notifier: Notifier) {
        this.notifier = notifier;
        this.wKInCheck = false;
        this.bKInCheck = false;
        this.moves = 0;
        this.threeFoldMoves = 0;
        this.the50ruleMoves = 0;
    }

    // TODO: refine the idea of line of sight for pinned pieces, rethink logic to avoid repetitive code (maybe update state,
    //       check if state is legal, if not revert back to previous state)

    checkForAttackingPiece([x, y]: [number, number], step: Step, color: Color, state: (Piece | undefined)[]): AttackPath {
        const [x1, y1] = [x + step.x, y + step.y];
        let attack: AttackPath = [];
        if (Utils.xyWithingBounds(x1, y1)) {
            const targetSquare = Utils.toSquare(x1, y1);
            const piece: (Piece | undefined) = state[targetSquare];
            if (piece) {
                const isOpponent = piece.color !== color;
                const isPawn = piece instanceof Pawn;
                const isKnight = piece instanceof Knight;

                if (isOpponent && (isPawn || isKnight)) {
                    attack.push(targetSquare);
                }
            }
        }
        return attack;
    }

    walkPath(startSquare: number, step: Step, color: Color, state: (Piece | undefined)[]): AttackPath {
        let stopWalking: boolean = false;
        let square: number = startSquare;
        let attack: AttackPath = [];
        while ((square < 64 && square > -1) && !stopWalking) {
            const [x, y]: [number, number] = Utils.toXY(square);
            const [x1, y1]: [number, number] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds(x1, y1)) {
                const targetSquare: number = Utils.toSquare(x1, y1);
                const piece: (Piece | undefined) = state[targetSquare];

                attack.push(targetSquare);

                if (piece) {
                    const isOpponent = piece.color !== color;

                    const isRook = piece instanceof Rook;
                    const isBishop = piece instanceof Bishop;
                    const isQueen = piece instanceof Queen;

                    const slidesDiagonally = this.isDiagonalStep(step) && (isBishop || isQueen);
                    const slidesOrthogonally = this.isOrthogonalStep(step) && (isRook || isQueen);

                    if (isOpponent && (slidesDiagonally || slidesOrthogonally)) {
                        return attack;
                    } else {
                        stopWalking = true;
                    }
                }
                square = targetSquare;
            } else {
                stopWalking = true;
            }
        }
        return [];
    }

    findKingAttackingPieces(square: number, state: (Piece | undefined)[], color: Color): AttackPath[] {
        const attackingPieces: AttackPath[] = [];
        const pawnChecks = color === Color.BLACK ? MOVE_CHECKS.PAWN.CHECK.B : MOVE_CHECKS.PAWN.CHECK.W;
        const [x, y] = Utils.toXY(square);
        for (const step of [...pawnChecks, ...MOVE_CHECKS.KNIGHT]) {
            const attack = this.checkForAttackingPiece([x, y], step, color, state);
            if (attack.length > 0) {
                attackingPieces.push(attack);
            }
        }
        for (const step of MOVE_CHECKS.QUEEN) {
            const attack = this.walkPath(square, step, color, state);
            if (attack.length > 0) {
                attackingPieces.push(attack);
            }
        }
        return attackingPieces;
    }

    checkForPinnedPieceInPath(startSquare: number, step: Step, state: (Piece | undefined)[], color: Color): AttackPath {

        let attackPath: AttackPath = [];

        const isOrthogonalStep = this.isOrthogonalStep(step);
        const isDiagonalStep = this.isDiagonalStep(step);

        let stopWalking = false;
        let square = startSquare;
        let hasDefender = false;

        while (square > -1 && square < 64 && !stopWalking) {
            const [x, y] = Utils.toXY(square);
            const [x1, y1] = [x + step.x, y + step.y];
            if (Utils.xyWithingBounds(x1, y1)) {
                const targetSquare = Utils.toSquare(x1, y1);
                attackPath.push(targetSquare);

                const piece = state[targetSquare];
                if (piece) {

                    const isQueen = piece instanceof Queen;
                    const isRook = piece instanceof Rook;
                    const isBishop = piece instanceof Bishop;

                    const slidesOrthogonally = isOrthogonalStep && (isRook || isQueen);
                    const slidesDiagonally = isDiagonalStep && (isQueen || isBishop);

                    if (piece.color === color) {
                        if (!hasDefender) {
                            hasDefender = true;
                        } else {
                            stopWalking = true;
                        }
                    } else {
                        if (slidesDiagonally || slidesOrthogonally) {
                            if (hasDefender) {
                                return attackPath;
                            }
                        }
                        return [];
                    }
                }
                square = targetSquare;
            } else {
                stopWalking = true;
            }
        }

        return [];
    }

    findPinnedPieces(square: number, state: (Piece | undefined)[], color: Color): AttackPath[] {
        // a bishop or a queen or a rook can each pin only 1 piece
        // this array is guaranteed to have unique pins
        let attacks: AttackPath[] = [];

        for (const step of MOVE_CHECKS.QUEEN) {
            const attackPath = this.checkForPinnedPieceInPath(square, step, state, color);
            if (attackPath.length > 0) {
                attacks.push(attackPath);
            }
        }

        return attacks;
    }

    isOrthogonalStep(step: Step) {
        return (step.x === 0) || (step.y === 0);
    }

    isDiagonalStep(step: Step) {
        return (step.x !== 0) && (step.y !== 0);
    }

}