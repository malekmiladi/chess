import { Board, MoveOperation } from "./board.js";
import { GameEvent, GameEventType } from "./game-events.js";
import { Notifier } from "./notifier.js";
import { Move, Piece } from "./pieces.js";
import { Utils } from "./utils.js";

export class DisplayDriver {
    ctx: HTMLDivElement;
    notifier: Notifier;
    draggedPiece: number | null;
    constructor(ctx: HTMLDivElement, notifier: Notifier) {
        this.ctx = ctx;
        this.notifier = notifier;
        this.draggedPiece = null;
    }
    drawBoard() {
        let container = document.createElement("div");
        container.classList.add("board");
        let row: number = 0;
        while (row < 8) {
            const startWithWhite: boolean = row % 2 == 0;
            let squareRow = document.createElement('div');
            squareRow.classList.add("row")
            for (let i: number = 0; i < 8; i++) {
                let square = document.createElement('div');
                square.classList.add("square");
                square.setAttribute("x", row.toString());
                square.setAttribute("y", i.toString());
                square.setAttribute("index", Utils.toIndex(row, i).toString());

                if (startWithWhite) {
                    if (i % 2 == 0) {
                        square.classList.add("white");
                    } else {
                        square.classList.add("brown");
                    }
                } else {
                    if (i % 2 == 0) {
                        square.classList.add("brown");
                    } else {
                        square.classList.add("white");
                    }
                }
                squareRow.appendChild(square);
            }
            container.appendChild(squareRow);
            row++;
        }
        this.ctx.appendChild(container);
    }

    onDragStart = (e: Event) => {
        const pieceObject: HTMLElement = <HTMLElement>e.target;
        const originalSquare: HTMLElement | null = pieceObject.parentElement;
        const [x, y]: [number, number] = Utils.extractXYFromElement(originalSquare);
        this.draggedPiece = Utils.toIndex(x, y);
    }

    onDragOver = (e: Event) => {
        e.preventDefault();
    }

    onDrop = (e: Event) => {
        e.stopPropagation();
        let targetSquare: HTMLElement | null | undefined = <HTMLElement>e.target;
        if (targetSquare.classList.contains("piece")) {
            targetSquare = targetSquare.parentElement as HTMLDivElement;
        }
        const [xTarget, yTarget]: [number, number] = Utils.extractXYFromElement(targetSquare);
        const movePieceEvent: GameEvent = {
            type: GameEventType.MOVE_PIECE,
            move: {
                current: this.draggedPiece,
                target: Utils.toIndex(xTarget, yTarget)
            } as Move
        }
        this.notifier.notify(movePieceEvent);
    }

    drawPieces(board: Board) {
        let boardContainer: HTMLDivElement = this.ctx.children[0].cloneNode(true) as HTMLDivElement;
        for (let i: number = 0; i < 64; i++) {
            const [x, y]: [number, number] = Utils.toXY(i);
            const square = boardContainer.children[x].children[y];
            square.addEventListener("dragstart", this.onDragStart);
            square.addEventListener("dragover", this.onDragOver);
            square.addEventListener("drop", this.onDrop);
            const piece: (Piece | undefined) = board.currState[i];
            if (piece) {
                let pieceObject = document.createElement("div");
                pieceObject.classList.add("piece");
                pieceObject.draggable = true;
                let pieceSprite = document.createElement('img');
                pieceSprite.setAttribute("type", "image/svg+xml");
                pieceSprite.setAttribute("src", piece.sprite.svg);
                pieceObject.appendChild(pieceSprite);
                square.appendChild(pieceObject);
            }
        }
        this.ctx.children[0].replaceWith(boardContainer);
    }

    applyMove(op: MoveOperation) {
        let boardContainer: HTMLDivElement = this.ctx.children[0] as HTMLDivElement;
        const from: number = op.move.current;
        const [x, y]: [number, number] = Utils.toXY(from);
        const to: number = op.move.target;
        const [x1, y1]: [number, number] = Utils.toXY(to);
        const fromSuare: HTMLDivElement = boardContainer.children[x].children[y] as HTMLDivElement;
        const toSquare: HTMLDivElement = boardContainer.children[x1].children[y1] as HTMLDivElement;
        if (op.take) {
            toSquare.firstChild?.remove();
        }
        toSquare.append(fromSuare.firstChild as HTMLDivElement);
        fromSuare.firstChild?.remove();
    }

}