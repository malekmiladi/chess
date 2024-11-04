import {AttackPath} from "./arbiter.js";

export class Utils {
    static xToFile(x: number): string {
        return 'a' + x;
    }

    static yToRank(y: number): string {
        return (y + 1).toString();
    }

    static toXY(squareIndex: number): [number, number] {
        return [Math.floor(squareIndex / 8), squareIndex % 8];
    }

    static toSquare(x: number, y: number) {
        return x * 8 + y;
    }

    static xyWithingBounds(x: number, y: number) {
        return (-1 < x && x < 8) && (-1 < y && y < 8);
    }

    static extractXYFromElement(element: (HTMLElement | null | undefined)): [number, number] {
        const x: number = Number(element?.getAttribute("x"));
        const y: number = Number(element?.getAttribute("y"));
        return [x, y];
    }

    static thisIsPinned(square: number, pins: AttackPath[]): [isPinned: boolean, path: AttackPath] {
        for (const attack of pins) {
            if (attack.includes(square)) {
                return [true, attack];
            }
        }
        return [false, []]
    }

    static moveBlocksCheck(square: number, kChecks: AttackPath[]): boolean {
        let blockCount = kChecks.length;
        for (const path of kChecks) {
            if (path.includes(square)) {
                blockCount--;
            }
        }
        return blockCount === 0;
    }

}