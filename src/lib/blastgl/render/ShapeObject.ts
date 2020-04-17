import Rectangle from "../../math/geom/Rectangle";
import Matrix2D from "../../math/geom/Matrix2D";
import {TypeRenderObjectParameters} from "./RenderObject";

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
    public width: number;
    public height: number;
    public scaleX: number;
    public scaleY: number;
    public rotation: number;
    public readonly area: Rectangle = new Rectangle();

    // Other
    public parent: ShapeObject;
    public readonly matrix: Matrix2D = new Matrix2D();

    constructor({ x, y, width, height, scaleX, scaleY, rotation, zIndex }: TypeShapeObjectParameters = {}) {
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 0;
        this.height = height || 0;
        this.scaleX = scaleX || 1;
        this.scaleY = scaleY || 1;
        this.rotation = rotation || 0;
        this.zIndex = zIndex || 0;
    }

    update(delta: number): void {

    }
}