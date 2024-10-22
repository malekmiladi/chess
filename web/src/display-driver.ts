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
    constructor(ctx: HTMLDivElement, notifier: Notifier) {
        this.ctx = ctx as HTMLDivElement;
        this.notifier = notifier;
        this.draggedPiece = null;
        this.highlightedSquares = [];
    }

    drawBoard(): void {
        let container = document.createElement("div");
        container.classList.add("board");
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
            container.appendChild(squareRow);
            row++;
        }
        this.ctx.appendChild(container);
    }

    onDragStart = (e: Event): void => {
        const pieceObject: HTMLElement = <HTMLElement>e.target;
        const originalSquare: HTMLElement | null = pieceObject.parentElement;
        const [x, y]: [number, number] = Utils.extractXYFromElement(originalSquare);
        this.draggedPiece = Utils.toIndex(x, y);
    }

    onDragOver = (e: Event): void => {
        e.preventDefault();
    }

    onDrop = (e: Event): void => {
        e.stopPropagation();
        let boardContainer: HTMLDivElement = this.ctx.children[0] as HTMLDivElement;
        this.removeHighlight(boardContainer);
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
        const square = e.target as HTMLElement;
        const [x, y]: [number, number] = Utils.extractXYFromElement(square.parentElement);
        this.notifier.notify({
            type: GameEventType.HIGHLIGHT_LEGAL_MOVES,
            square: Utils.toIndex(x, y)
        });
    }


    drawPieces(board: Board): void {
        let boardContainer: HTMLDivElement = this.ctx.children[0].cloneNode(true) as HTMLDivElement;
        for (let i: number = 0; i < 64; i++) {
            const [x, y]: [number, number] = Utils.toXY(i);
            const square = boardContainer.children[x].children[y];
            square.addEventListener("dragstart", this.onDragStart);
            square.addEventListener("dragover", this.onDragOver);
            square.addEventListener("drop", this.onDrop);
            square.addEventListener("click", this.onClick);
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

    applyMove(op: MoveOperation): void {
        let boardContainer: HTMLDivElement = this.ctx.children[0] as HTMLDivElement;
        this.removeHighlight(boardContainer);
        const from: number = op.move.from;
        const [x, y]: [number, number] = Utils.toXY(from);
        const fromSuare: HTMLDivElement = boardContainer.children[x].children[y] as HTMLDivElement;

        const to: number = op.move.to;
        const [x1, y1]: [number, number] = Utils.toXY(to);
        const toSquare: HTMLDivElement = boardContainer.children[x1].children[y1] as HTMLDivElement;

        if (op.take) {
            toSquare.firstChild?.remove();
        }
        toSquare.append(fromSuare.firstChild as HTMLDivElement);
        fromSuare.firstChild?.remove();
    }

    highlightLegalMoves(legalMoves: number[]): void {
        let boardContainer: HTMLDivElement = this.ctx.children[0] as HTMLDivElement;
        this.removeHighlight(boardContainer);
        this.highlightedSquares = legalMoves;
        legalMoves.forEach((square: number) => {
            const [x, y]: [number, number] = Utils.toXY(square);
            const squareElement: HTMLDivElement = boardContainer.children[x].children[y] as HTMLDivElement;
            let dot = document.createElement("span");
            dot.classList.add("legal-move");
            squareElement.appendChild(dot);
        });
    }

    removeHighlight(boardContainer: HTMLDivElement): void {
        this.highlightedSquares.forEach((square: number) => {
            const [x, y]: [number, number] = Utils.toXY(square);
            const squareElement: HTMLDivElement = boardContainer.children[x].children[y] as HTMLDivElement;
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