export class Utils {
    xToFile(x: number): string {
        return 'a' + x;
    } 
    yToRank(y: number): string {
        return (y + 1).toString();
    }
}