import {CastleMove, EnPassantMove, LegalMovesHighlightOptions, MoveOperation, MoveType, Promotions} from "./board.js";
import {GameEventType} from "./game-events.js";
import {Notifier} from "./notifier.js";
import {Color, Move, Piece} from "./pieces.js";
import {Utils} from "./utils.js";
import {SPRITES} from "./sprites.js";

export class Display {

    ctx: HTMLDivElement;
    notifier: Notifier;
    draggedPiece: number | null;
    highlightedSquares: number[];
    selectedSquare: number;
    boardContainer: HTMLDivElement;
    promotionBox: HTMLDivElement;

    constructor(ctx: HTMLDivElement, notifier: Notifier) {
        this.ctx = ctx as HTMLDivElement;
        this.boardContainer = this.ctx.children[0] as HTMLDivElement;
        this.promotionBox = this.ctx.children[1] as HTMLDivElement;
        this.notifier = notifier;
        this.draggedPiece = null;
        this.highlightedSquares = [];
        this.selectedSquare = -1;
        this.promotionBox.hidePopover();
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
                square.setAttribute("index", Utils.toSquare(row, i).toString());
                square.addEventListener("dragstart", this.onDragStart);
                square.addEventListener("dragover", this.onDragOver);
                square.addEventListener("dragend", this.onDragEnd);
                square.addEventListener("drop", this.onDrop);
                square.addEventListener("pointerdown", this.onPointerDown);
                if (row % 2 === 0) {
                    if (i % 2 === 0) {
                        square.classList.add("white");
                    } else {
                        square.classList.add("brown");
                    }
                } else {
                    if (i % 2 === 0) {
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
        this.draggedPiece = Utils.toSquare(x, y);
        (<HTMLElement>e.target).style.cursor = "grabbing";
    }

    onDragOver = (e: Event): void => {
        e.preventDefault();
    }

    onDragEnd = (e: Event): void => {
        const originalSquare: HTMLElement = e.currentTarget as HTMLElement;
        const [x, y]: [number, number] = Utils.extractXYFromElement(originalSquare);
        this.draggedPiece = Utils.toSquare(x, y);
        (<HTMLElement>e.target).style.cursor = "";
    }

    onDrop = (e: Event): void => {
        e.stopPropagation();
        this.removeHighlights();
        this.selectedSquare = -1;
        let targetSquare: HTMLElement | null | undefined = <HTMLElement>e.target;
        if (targetSquare.classList.contains("piece")) {
            targetSquare = targetSquare.parentElement as HTMLDivElement;
        }
        const [xTarget, yTarget]: [number, number] = Utils.extractXYFromElement(targetSquare);

        this.notifier.notify({
            type: GameEventType.MOVE_PIECE,
            move: {
                from: this.draggedPiece,
                to: Utils.toSquare(xTarget, yTarget)
            } as Move
        });
    }

    onPointerDown = (e: Event): void => {
        const squareElement = e.currentTarget as HTMLElement;
        const [x, y]: [number, number] = Utils.extractXYFromElement(squareElement);
        const square = Utils.toSquare(x, y);
        this.removeHighlights();
        this.selectedSquare = square;
        this.notifier.notify({
            type: GameEventType.HIGHLIGHT_LEGAL_MOVES,
            square: square
        });
    }

    createPiece(square: Element, piece: Piece) {
        let pieceObject = document.createElement("div");
        pieceObject.classList.add("piece");
        pieceObject.style.cursor = "";
        pieceObject.draggable = true;
        let pieceSprite = document.createElement('img');
        pieceSprite.setAttribute("type", "image/svg+xml");
        pieceSprite.setAttribute("src", piece.sprite.SVG);
        pieceObject.appendChild(pieceSprite);
        square.appendChild(pieceObject);
    }

    drawPieces(playAsWhite: boolean, state: (Piece | undefined)[]): void {
        for (let i: number = 0; i < 64; i++) {
            const adjustedSquare = playAsWhite ? i : Math.abs(i - 63);
            const [x, y]: [number, number] = Utils.toXY(i);
            const square = this.boardContainer.children[x].children[y];
            const piece: (Piece | undefined) = state[adjustedSquare];
            if (piece) {
                this.createPiece(square, piece);
            }
        }
    }

    applyMove(op: MoveOperation): void {
        this.removeHighlights();
        const from: number = op.action.move.from;
        const [x, y]: [number, number] = Utils.toXY(from);
        const fromSquare: HTMLDivElement = this.boardContainer.children[x].children[y] as HTMLDivElement;

        const to: number = op.action.move.to;
        const [x1, y1]: [number, number] = Utils.toXY(to);
        const toSquare: HTMLDivElement = this.boardContainer.children[x1].children[y1] as HTMLDivElement;

        if (op.type === MoveType.TAKE || op.type === MoveType.PROMOTION_AND_TAKE) {
            toSquare.firstChild?.remove();
        }

        if (op.type === MoveType.CASTLE) {
            const castleFrom: number = (<CastleMove>op.action).rook.from;
            const [castleFromX, castleFromY]: [number, number] = Utils.toXY(castleFrom);
            const castleFromSquare: HTMLDivElement = this.boardContainer.children[castleFromX].children[castleFromY] as HTMLDivElement;

            const castleTo: number = (<CastleMove>op.action).rook.to;
            const [castleToX, castleToY]: [number, number] = Utils.toXY(castleTo);
            const castleToSquare: HTMLDivElement = this.boardContainer.children[castleToX].children[castleToY] as HTMLDivElement;

            castleToSquare.appendChild(castleFromSquare.firstChild as HTMLDivElement);
            castleFromSquare.firstChild?.remove();
        }

        if (op.type === MoveType.EN_PASSANT) {
            const opponentPiece: number = (<EnPassantMove>op.action).opponent;
            const [opponentX, opponentY]: [number, number] = Utils.toXY(opponentPiece);
            const opponentSquare: HTMLDivElement = this.boardContainer.children[opponentX].children[opponentY] as HTMLDivElement;
            opponentSquare.firstChild?.remove();
        }

        toSquare.append(fromSquare.firstChild as HTMLDivElement);
        fromSquare.firstChild?.remove();
    }

    onChoiceClick = (e: MouseEvent) => {
        const choice: string = (<HTMLElement>e.currentTarget).getAttribute("piece") as string;
        this.promotionBox.hidePopover();
        this.promotionBox.replaceChildren();
        this.notifier.notify({
            type: GameEventType.PROMOTION_CHOICE,
            choice: parseInt(choice)
        });
    }

    createPromotionChoice(choice: number, color: Color) {
        let choiceElement = document.createElement("div");
        choiceElement.setAttribute("class", "choice");
        choiceElement.setAttribute("piece", choice.toString());
        choiceElement.addEventListener("click", this.onChoiceClick);
        let pieceObject = document.createElement("img");
        pieceObject.setAttribute("type", "image/svg+xml");
        switch (choice) {
            case Promotions.QUEEN: {
                const spriteSvg = color === Color.BLACK ? SPRITES.QUEEN.B.SVG : SPRITES.QUEEN.W.SVG;
                pieceObject.setAttribute("src", spriteSvg);
                break;
            }
            case Promotions.ROOK: {
                const spriteSvg = color === Color.BLACK ? SPRITES.ROOK.B.SVG : SPRITES.ROOK.W.SVG;
                pieceObject.setAttribute("src", spriteSvg);
                break;
            }
            case Promotions.BISHOP: {
                const spriteSvg = color === Color.BLACK ? SPRITES.BISHOP.B.SVG : SPRITES.BISHOP.W.SVG;
                pieceObject.setAttribute("src", spriteSvg);
                break;
            }
            case Promotions.KNIGHT: {
                const spriteSvg = color === Color.BLACK ? SPRITES.KNIGHT.B.SVG : SPRITES.KNIGHT.W.SVG;
                pieceObject.setAttribute("src", spriteSvg);
                break;
            }
        }
        choiceElement.appendChild(pieceObject);
        this.promotionBox.appendChild(choiceElement);
    }

    promptForPromotion(spriteColor: Color) {
        for (let i = 0; i < 4; i++) {
            this.createPromotionChoice(i, spriteColor);
        }
        this.promotionBox.showPopover();
    }

    applyPromotion(square: number, choice: number, color: Color) {
        const [x, y]: [number, number] = Utils.toXY(square);
        const pieceSquare: HTMLDivElement = this.boardContainer.children[x].children[y] as HTMLDivElement;
        const piece = pieceSquare.firstChild as HTMLDivElement;
        const img = piece.firstChild as HTMLImageElement
        switch (choice) {
            case Promotions.QUEEN: {
                img.src = color === Color.BLACK ? SPRITES.QUEEN.B.SVG : SPRITES.QUEEN.W.SVG;
                break;
            }
            case Promotions.ROOK: {
                img.src = color === Color.BLACK ? SPRITES.ROOK.B.SVG : SPRITES.ROOK.W.SVG;
                break;
            }
            case Promotions.BISHOP: {
                img.src = color === Color.BLACK ? SPRITES.BISHOP.B.SVG : SPRITES.BISHOP.W.SVG;
                break;
            }
            case Promotions.KNIGHT: {
                img.src = color === Color.BLACK ? SPRITES.KNIGHT.B.SVG : SPRITES.KNIGHT.W.SVG;
                break;
            }
        }
    }

    toggleHighLights(legalMovesOptions: LegalMovesHighlightOptions): void {
        this.removeHighlights();
        this.highlightedSquares = legalMovesOptions.legalMoves;
        this.highlightedSquares.forEach((square: number) => {
            const [x, y]: [number, number] = Utils.toXY(square);
            const squareElement: HTMLDivElement = this.boardContainer.children[x].children[y] as HTMLDivElement;
            let dot = document.createElement("span");
            dot.classList.add("legal-move");
            squareElement.appendChild(dot);
        });

        if ((this.selectedSquare !== -1) && (legalMovesOptions.hasPiece)) {
            this.highlightSelectedSquare();
        } else {
            this.selectedSquare = -1;
        }
    }


    removeHighlights(): void {
        this.removeSquareHighlight();
        this.removeLegalMovesHighlight();
    }

    removeLegalMovesHighlight() {
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

    checkKing(square: number): void {
        const [x, y] = Utils.toXY(square);
        const kingSquare = this.boardContainer.children[x].children[y] as HTMLDivElement;
        let checkSpan = document.createElement("span");
        checkSpan.classList.add("check");
        kingSquare.appendChild(checkSpan);
    }

    clearCheck(square: number): void {
        const [x, y] = Utils.toXY(square);
        const kingSquare = this.boardContainer.children[x].children[y] as HTMLDivElement;
        const children = kingSquare.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLSpanElement;
            if (child?.classList.contains("check")) {
                kingSquare.removeChild(child as Node);
            }
        }
    }

    highlightSelectedSquare(): void {
        const [selectedSquareX, selectedSquareY] = Utils.toXY(this.selectedSquare);
        const squareElement: HTMLDivElement = this.boardContainer.children[selectedSquareX].children[selectedSquareY] as HTMLDivElement;
        let highlightSpan = document.createElement("span");
        highlightSpan.classList.add("highlight");
        squareElement.appendChild(highlightSpan);
    }

    removeSquareHighlight(): void {
        let [selectedSquareX, selectedSquareY]: [number, number] = [-1, -1];
        if (this.selectedSquare !== -1) {
            [selectedSquareX, selectedSquareY] = Utils.toXY(this.selectedSquare);
        }
        if (selectedSquareX !== -1 && selectedSquareY !== -1) {
            const squareElement: HTMLDivElement = this.boardContainer.children[selectedSquareX].children[selectedSquareY] as HTMLDivElement;
            const squareExtras = squareElement.children;
            for (let i = 0; i < squareExtras.length; i++) {
                const child = squareExtras[i] as HTMLSpanElement;
                if (child?.classList.contains("highlight")) {
                    squareElement.removeChild(child as Node);
                }
            }
        }
    }

}