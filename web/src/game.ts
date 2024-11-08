import {Board, LegalMovesHighlightOptions, MoveType} from "./board.js";
import {Display} from "./display.js";
import {GameEvent, GameEventType} from "./game-events.js";
import {Notifier, Subscriber} from "./notifier.js";
import {Arbiter} from "./arbiter.js";
import {AudioManager} from "./audio.js";

export type GameState = {
    whiteTurn: boolean;
    playAsWhite: boolean;
}

export class Game implements Subscriber {

    ctx: HTMLDivElement;
    notifier: Notifier;
    board: Board;
    arbiter: Arbiter;
    displayDriver: Display;
    audioManager: AudioManager;
    state: GameState;

    constructor(ctx: HTMLDivElement) {
        this.ctx = ctx;
        this.state = { whiteTurn: true, playAsWhite: true };
        this.notifier = new Notifier(this);
        this.arbiter = new Arbiter(this.notifier);
        this.displayDriver = new Display(ctx.ownerDocument.getElementById("game") as HTMLDivElement, this.notifier);
        this.audioManager = new AudioManager();
        this.board = new Board(this.notifier, this.arbiter);
    }

    run() {
        this.displayDriver.drawBoard();
        this.displayDriver.drawPieces(this.state.playAsWhite, this.board.getCurrentState());
    }

    update(event: GameEvent) {
        switch (event.type) {
            case GameEventType.MOVE_PIECE: {
                if (event.move.from !== event.move.to) {
                    this.board.movePiece(event.move, this.state);
                }
                break;
            }
            case GameEventType.HIGHLIGHT_LEGAL_MOVES: {
                const legalMovesHighlightOptions: LegalMovesHighlightOptions = this.board.getLegalMoves(event.square, this.state.playAsWhite);
                this.displayDriver.toggleHighLights(legalMovesHighlightOptions);
                break;
            }
            case GameEventType.UPDATE_DISPLAY: {
                this.state.whiteTurn = !this.state.whiteTurn;
                this.displayDriver.applyMove(event.op);
                switch (event.op.type) {
                    case MoveType.MOVE: {
                        this.audioManager.playAudio("move");
                        break;
                    }
                    case MoveType.CASTLE: {
                        this.audioManager.playAudio("castle");
                        break;
                    }
                    case MoveType.TAKE: {
                        this.audioManager.playAudio("capture");
                    }
                }
                break;
            }
            case GameEventType.PROMOTION: {
                this.displayDriver.promptForPromotion(event.color);
                break;
            }
            case GameEventType.PROMOTION_CHOICE: {
                this.board.promotePiece(event.choice, this.state.playAsWhite);
                break;
            }
            case GameEventType.PROMOTION_SUCCESS: {
                this.displayDriver.applyPromotion(event.square, event.choice, event.color);
                this.audioManager.playAudio("promote");
                break;
            }
            case GameEventType.CHECK: {
                this.displayDriver.checkKing(event.square);
                this.audioManager.playAudio("check");
                break;
            }
            case GameEventType.CLEAR_CHECK: {
                // TODO: work out a better way of doing this
                if (this.arbiter.wKInCheck || this.arbiter.bKInCheck) {
                    this.displayDriver.clearCheck(event.square);
                }
                break;
            }
        }
    }
} 