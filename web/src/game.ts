import { Board, MoveOperation } from "./board.js";
import { DisplayDriver } from "./display-driver.js";
import { GameEvent, GameEventType } from "./game-events.js";
import { Notifier, Subscriber } from "./notifier.js";

export class Game implements Subscriber {

    ctx: HTMLDivElement;
    notifier: Notifier;
    board: Board;
    displayDriver: DisplayDriver;
    whitesTurn: boolean;

    constructor(ctx: HTMLDivElement) {
        this.ctx = ctx;
        this.notifier = new Notifier(this);
        this.board = new Board(this.notifier);
        this.displayDriver = new DisplayDriver(ctx.ownerDocument.getElementById("game") as HTMLDivElement, this.notifier);
        this.whitesTurn = true;
    }

    run() {
        this.displayDriver.drawBoard();
        this.displayDriver.drawPieces(this.board.getCurrentState());
    }
    
    update(event: GameEvent) {
        switch (event.type) {
            case GameEventType.MOVE_PIECE:
                if (event.move.from !== event.move.to) {
                    const moveApplied: MoveOperation = this.board.movePiece(event.move, this.whitesTurn);
                    if (moveApplied.success) {
                        this.whitesTurn = !this.whitesTurn;
                        this.displayDriver.applyMove(moveApplied);
                    }
                }
                break;
            case GameEventType.HIGHLIGHT_LEGAL_MOVES:
                const legalMoves: number[] = this.board.getLegalMoves(event.square);
                this.displayDriver.highlightLegalMoves(legalMoves);
        }
    }
} 