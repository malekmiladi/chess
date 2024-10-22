import { Board, MoveOperation } from "./board.js";
import { GameEvent, GameEventType } from "./game-events.js";
import { Notifier } from "./notifier.js";
import { Move, Piece } from "./pieces.js";
import { Utils } from "./utils.js";

export class DisplayDriver {
    
    ctx: HTMLDivElement;
    notifier: Notifier;
    draggedPiece: number | null;
    highlightedSquares: number[];
    boardContainer: HTMLDivElement;
    
    constructor(ctx: HTMLDivElement, notifier: Notifier) {
        this.ctx = ctx as HTMLDivElement;
        this.boardContainer = this.ctx.children[0] as HTMLDivElement;
        this.notifier = notifier;
        this.draggedPiece = null;
        this.highlightedSquares = [];
    }

    drawBoard(): void {
        let row: number = 0;
        while (row < 8) {
            let squareRow = document.createElement('div');
            squareRow.classList.add("row")
            for (let i: number = 0; i < 8; i++) {
                let square = document.createElement('div');
                square.classList.add("square");
                square.setAttribute("x", row.toString());
                square.setAttribute("y", i.toString());
                square.setAttribute("index", Utils.toIndex(row, i).toString());
                if (row % 2 == 0) {
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
            this.boardContainer.appendChild(squareRow);
            row++;
        }
    }

    onDragStart = (e: Event): void => {
        const originalSquare: HTMLElement = e.currentTarget as HTMLElement;
        const [x, y]: [number, number] = Utils.extractXYFromElement(originalSquare);
        this.draggedPiece = Utils.toIndex(x, y);
    }

    onDragOver = (e: Event): void => {
        e.preventDefault();
    }

    onDrop = (e: Event): void => {
        e.stopPropagation();
        this.removeHighlight();
        let targetSquare: HTMLElement | null | undefined = <HTMLElement>e.target;
        if (targetSquare.classList.contains("piece")) {
            targetSquare = targetSquare.parentElement as HTMLDivElement;
        }
        const [xTarget, yTarget]: [number, number] = Utils.extractXYFromElement(targetSquare);
        const movePieceEvent: GameEvent = {
            type: GameEventType.MOVE_PIECE,
            move: {
                from: this.draggedPiece,
                to: Utils.toIndex(xTarget, yTarget)
            } as Move
        }
        this.notifier.notify(movePieceEvent);
    }

    onClick = (e: Event): void => {
        const square = e.currentTarget as HTMLElement;
        const [x, y]: [number, number] = Utils.extractXYFromElement(square);
        this.notifier.notify({
            type: GameEventType.HIGHLIGHT_LEGAL_MOVES,
            square: Utils.toIndex(x, y)
        });
    }


    drawPieces(state: (Piece | undefined)[]): void {
        for (let i: number = 0; i < 64; i++) {
            const [x, y]: [number, number] = Utils.toXY(i);
            const square = this.boardContainer.children[x].children[y];
            square.addEventListener("dragstart", this.onDragStart);
            square.addEventListener("dragover", this.onDragOver);
            square.addEventListener("drop", this.onDrop);
            square.addEventListener("click", this.onClick);
            const piece: (Piece | undefined) = state[i];
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
    }

    applyMove(op: MoveOperation): void {
        this.removeHighlight();
        const from: number = op.move.from;
        const [x, y]: [number, number] = Utils.toXY(from);
        const fromSuare: HTMLDivElement = this.boardContainer.children[x].children[y] as HTMLDivElement;

        const to: number = op.move.to;
        const [x1, y1]: [number, number] = Utils.toXY(to);
        const toSquare: HTMLDivElement = this.boardContainer.children[x1].children[y1] as HTMLDivElement;

        if (op.take) {
            toSquare.firstChild?.remove();
        }
        toSquare.append(fromSuare.firstChild as HTMLDivElement);
        fromSuare.firstChild?.remove();
    }

    highlightLegalMoves(legalMoves: number[]): void {
        this.removeHighlight();
        this.highlightedSquares = legalMoves;
        legalMoves.forEach((square: number) => {
            const [x, y]: [number, number] = Utils.toXY(square);
            const squareElement: HTMLDivElement = this.boardContainer.children[x].children[y] as HTMLDivElement;
            let dot = document.createElement("span");
            dot.classList.add("legal-move");
            squareElement.appendChild(dot);
        });
    }

    removeHighlight(): void {
        this.highlightedSquares.forEach((square: number) => {
            const [x, y]: [number, number] = Utils.toXY(square);
            const squareElement: HTMLDivElement = this.boardContainer.children[x].children[y] as HTMLDivElement;
            const children = squareElement.children;
            for (let i = 0; i < children.length; i++) {
                const child = children[i] as HTMLSpanElement;
                if (child?.classList.contains("legal-move")) {
                    squareElement.removeChild(child as Node);
                }
            }
        });

    }

}