import {Board, LegalMovesHighlightOptions, MoveType} from "./board.js";
import {DisplayManager} from "./display.js";
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
    displayManager: DisplayManager;
    audioManager: AudioManager;
    state: GameState;

    constructor(ctx: HTMLDivElement) {
        this.ctx = ctx;
        this.state = { whiteTurn: true, playAsWhite: true };
        this.notifier = new Notifier(this);
        this.arbiter = new Arbiter(this.notifier);
        this.displayManager = new DisplayManager(ctx.ownerDocument.getElementById("game") as HTMLDivElement, this.notifier);
        this.audioManager = new AudioManager();
        this.board = new Board(this.notifier, this.arbiter);
    }

    run() {
        this.displayManager.drawBoard();
        this.displayManager.drawPieces(this.state.playAsWhite, this.board.getCurrentState());
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
                this.displayManager.toggleHighLights(legalMovesHighlightOptions);
                break;
            }
            case GameEventType.UPDATE_DISPLAY: {
                this.state.whiteTurn = !this.state.whiteTurn;
                this.displayManager.applyMove(event.op);
                switch (event.op.type) {
                    case MoveType.MOVE: {
                        this.audioManager.playAudio("move");
                        break;
                    }
                    case MoveType.CASTLE: {
                        this.audioManager.playAudio("castle");
                        break;
                    }
                    case MoveType.TAKE:
                    case MoveType.EN_PASSANT: {
                        this.audioManager.playAudio("capture");
                    }
                }
                break;
            }
            case GameEventType.PROMOTION: {
                this.displayManager.promptForPromotion(event.color);
                break;
            }
            case GameEventType.PROMOTION_CHOICE: {
                this.board.promotePiece(event.choice, this.state.playAsWhite);
                break;
            }
            case GameEventType.PROMOTION_SUCCESS: {
                this.displayManager.applyPromotion(event.square, event.choice, event.color);
                this.audioManager.playAudio("promote");
                break;
            }
            case GameEventType.CHECK: {
                this.displayManager.checkKing(event.square);
                this.audioManager.playAudio("check");
                break;
            }
            case GameEventType.CLEAR_CHECK: {
                // TODO: work out a better way of doing this
                if (this.arbiter.wKInCheck || this.arbiter.bKInCheck) {
                    this.displayManager.clearCheck(event.square);
                }
                break;
            }
        }
    }
} 