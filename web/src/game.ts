import { Board, MoveOperation } from "./board.js";
import { DisplayDriver } from "./display-driver.js";
import { GameEvent, GameEventType } from "./game-events.js";
import { Notifier, Subscriber } from "./notifier.js";
import { Move } from "./pieces.js";

export class Game implements Subscriber {
    ctx: HTMLDivElement;
    notifier: Notifier;
    board: Board;
    displayDriver: DisplayDriver;
    constructor(ctx: HTMLDivElement) {
        this.ctx = ctx;
        this.notifier = new Notifier(this);
        this.board = new Board(this.notifier);
        this.displayDriver = new DisplayDriver(ctx, this.notifier);
    }
    run() {
        this.displayDriver.drawBoard();
        this.displayDriver.drawPieces(this.board);
    }
    update(event: GameEvent) {
        switch (event.type) {
            case GameEventType.MOVE_PIECE:
                const moveApplied: MoveOperation = this.board.movePiece(event.move);
                if (moveApplied.success) {
                    this.displayDriver.applyMove(moveApplied);
                }
                break;
            case GameEventType.HIGHLIGHT_LEGAL_MOVES:
                const legalMoves: number[] = this.board.getLegalMoves(event.square);
                this.displayDriver.highlightLegalMoves(legalMoves);
        }
    }
} 