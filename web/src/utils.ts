export class Utils {
    static xToFile(x: number): string {
        return 'a' + x;
    } 
    static yToRank(y: number): string {
        return (y + 1).toString();
    }
    static toXY(curr: number): [number, number] {
        return [Math.floor(curr / 8), curr % 8];
    }
    static toIndex(x: number, y: number) {
        return x * 8 + y;
    }
    static xyWithingBounds(xy: [number, number]) {
        const [x, y]: [number, number] = xy;
        return (-1 < x && x < 8) && (-1 < y && y < 8);
    }
    static extractXYFromElement(element: (HTMLElement | null | undefined)): [number, number] {
        const x: number = Number(element?.getAttribute("x"));
        const y: number = Number(element?.getAttribute("y"));
        return [x, y];
    }
}