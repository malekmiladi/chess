import {Board} from "./board.js";
import {DisplayDriver} from "./display-driver.js";
import {GameEvent, GameEventType} from "./game-events.js";
import {Notifier, Subscriber} from "./notifier.js";

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
            case GameEventType.MOVE_PIECE: {
                if (event.move.from !== event.move.to) {
                    this.board.movePiece(event.move, this.whitesTurn);
                }
                break;
            }
            case GameEventType.HIGHLIGHT_LEGAL_MOVES: {
                const legalMoves: number[] = this.board.getLegalMoves(event.square);
                this.displayDriver.highlightLegalMoves(legalMoves);
                break;
            }
            case GameEventType.UPDATE_DISPLAY: {
                this.whitesTurn = !this.whitesTurn;
                this.displayDriver.applyMove(event.op);
                break;
            }
            case GameEventType.PROMOTION: {
                this.displayDriver.promptForPromotion(event.color);
                break;
            }
            case GameEventType.PROMOTION_CHOICE: {
                this.board.promotePiece(event.choice);
                break;
            }
            case GameEventType.PROMOTION_SUCCESS: {
                this.displayDriver.applyPromotion(event.square, event.choice, event.color);
            }
        }
    }
} 