import Matrix2D from "../../math/geom/Matrix2D";
import Rectangle from "../../math/geom/Rectangle";

export default class Camera {
    public readonly matrix: Matrix2D = new Matrix2D();
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;

    private _width: number;
    private _height: number;
    private _zoom: number = 1;

    // Области камеры
    public readonly spaceScreen: Rectangle = new Rectangle(); // размер экрана
    public readonly area: Rectangle = new Rectangle(); // активная область

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;
    }

    update(): void {
        const totalWidth = 2 / this._width * this.zoom;
        const totalHeight = 2 / this._height * this.zoom;

        this.matrix.identity();
        this.matrix.translate(this.x * totalWidth, this.y * totalHeight, this.z);
        this.matrix.scale(totalWidth, totalHeight, 0.01);

        // Вычисление области камеры
        this.area.left = this.spaceScreen.left - this.x;
        this.area.right = this.spaceScreen.right - this.x;
        this.area.top = this.spaceScreen.top - this.y;
        this.area.bottom = this.spaceScreen.bottom - this.y;

        // Рассчитываем область экрана
        this.spaceScreen.left = ((-(this._width / 1) / 2) / this.zoom);
        this.spaceScreen.right = (((this._width / 1) / 2) / this.zoom);
        this.spaceScreen.top = (((this._height / 1) / 2) / this.zoom);
        this.spaceScreen.bottom = ((-(this._height / 1) / 2) / this.zoom);
    }

    set zoom(value: number) {
        this._zoom = value;
        this.update();
    }

    get zoom(): number {
        return this._zoom;
    }
}