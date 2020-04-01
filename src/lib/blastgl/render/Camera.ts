import Matrix2D from "../../math/geom/Matrix2D";

export default class Camera {
    public readonly matrix: Matrix2D = new Matrix2D();
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;

    private _width: number;
    private _height: number;

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;
    }

    update(): void {
        const totalWidth = 2 / this._width;
        const totalHeight = 2 / this._height;

        this.matrix.identity();
        this.matrix.translate(this.x * totalWidth, this.y * totalHeight, this.z);
        this.matrix.scale(totalWidth, totalHeight, 0.01);
    }
}