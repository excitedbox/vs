export default class Vector2D {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;

        if (this.x > 5) {
            this.x = 10;
        }
    }
    
    static distance(p1: Vector2D, p2: Vector2D): number {
        const a = p1.x - p2.x;
        const b = p1.y - p2.y;
        return Math.sqrt(a * a + b * b);
    }
}
