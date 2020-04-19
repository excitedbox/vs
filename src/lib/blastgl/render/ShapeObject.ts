import Rectangle from "../../math/geom/Rectangle";
import Matrix2D from "../../math/geom/Matrix2D";
import BlastGL from "../BlastGL";

export type TypeShapeObjectParameters = {
    x?: number;
    y?: number;
    zIndex?: number;

    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;

    rotation?: number;
};

export default class ShapeObject {
    // Position and size
    public x: number;
    public y: number;
    public zIndex: number;
    public _width: number;
    public _height: number;
    public scaleX: number;
    public scaleY: number;
    public rotation: number;
    public readonly area: Rectangle = new Rectangle();

    // Other
    public parent: ShapeObject;
    public readonly matrix: Matrix2D = new Matrix2D();
    public isRemoved: boolean = false;

    constructor({ x, y, width, height, scaleX, scaleY, rotation, zIndex }: TypeShapeObjectParameters = {}) {
        this.x = x || 0;
        this.y = y || 0;
        this._width = width || 0;
        this._height = height || 0;
        this.scaleX = scaleX || 1;
        this.scaleY = scaleY || 1;
        this.rotation = rotation || 0;
        this.zIndex = zIndex || 0;
    }

    update(delta: number): void {

    }

    destroy(): void {
        this.isRemoved = true;
        BlastGL.scene.isNeedGarbageCollector = true;
    }

    get width(): number {
        return this._width;
    }

    set width(value: number) {
        this._width = value;
    }

    get height(): number {
        return this._height;
    }

    set height(value: number) {
        this._height = value;
    }
}