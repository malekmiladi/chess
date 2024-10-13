import { Board } from "./Board.js";
import { Notifier, Subscriber } from "./Notifier.js";

export class Game implements Subscriber {
    chess: HTMLDivElement;
    board: Board;
    notifier: Notifier;
    constructor(chess: HTMLDivElement) {
        this.notifier = new Notifier(this);
        this.board = new Board(this.notifier);
        this.chess = chess;
    }
    run() {
        console.log(this.board.currState);
    }
    update() {}
} 