export default class Vector2D {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
    
    static distance(p1: Vector2D, p2: Vector2D): number {
        const a = p1.x - p2.x;
        const b = p1.y - p2.y;
        return Math.sqrt(a * a + b * b);
    }

    static angle(p1: Vector2D, p2: Vector2D): number {
        const atan = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        return ((atan * 180 / Math.PI) + 90 + 360) % 360;
    }

    static fromAngle(angle: number): Vector2D {
        const vector = new Vector2D();
        vector.x = Math.sin(angle / 180 * Math.PI);
        vector.y = Math.cos(angle / 180 * Math.PI);
        return vector;
    }
}
