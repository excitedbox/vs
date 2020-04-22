import Matrix2D from "../../math/geom/Matrix2D";
import Rectangle from "../../math/geom/Rectangle";
import Input from "../../io/Input";
import Vector2D from "../../math/geom/Vector2D";

export default class Camera {
    public readonly matrix: Matrix2D = new Matrix2D();
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;

    private readonly _width: number;
    private readonly _height: number;
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
        this.spaceScreen.left = -this._width / 2 / this.zoom;
        this.spaceScreen.right = this._width / 2 / this.zoom;
        this.spaceScreen.top = this._height / 2 / this.zoom;
        this.spaceScreen.bottom = -this._height / 2 / this.zoom;
    }

    getInputWorldPosition(): Vector2D {
        return new Vector2D((Input.x - this._width / 2) / this._zoom - this.x, (Input.y - this._height / 2) / this._zoom - this.y);
    }

    set zoom(value: number) {
        this._zoom = value;
        this.update();
    }

    get zoom(): number {
        return this._zoom;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }
}