export default class Rectangle2D {
    public left: number = 0;
    public right: number = 0;
    public top: number = 0;
    public bottom: number = 0;

    constructor(left: number = 0, top: number = 0, right: number = 0, bottom: number = 0) {
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
    }

    // Check if point between to point
    private between(min: number, p: number, max: number): boolean {
        if (min < max) {
            if (p > min && p < max) {
                return true;
            }
        }
        if (min > max) {
            if (p > max && p < min) {
                return true;
            }
        }
        return p === min || p === max;
    };

    // Check point collision
    intersectPoint(x: number, y: number): boolean {
        return this.between(this.left, x, this.right) && this.between(this.top, y, this.bottom);
    };

    // Check rectangle collision
    intersectRectangle(rect: Rectangle2D, isReversed: boolean): boolean {
        if (isReversed) {
            return !(rect.left > this.right ||
                rect.right < this.left ||
                rect.top > this.bottom ||
                rect.bottom < this.top);
        }
        return !(rect.left > this.right ||
            rect.right < this.left ||
            rect.top < this.bottom ||
            rect.bottom > this.top);
    };

    get width(): number {
        return Math.sqrt((this.left - this.right) * (this.left - this.right));
    }

    get height(): number {
        return Math.sqrt((this.bottom - this.top) * (this.bottom - this.top));
    }
}