import Rectangle from "../../math/geom/Rectangle";

export type TypeRenderObjectParameters = {
    x: number;
    y: number;
    z: number;

    width: number;
    height: number;
    scaleX: number;
    scaleY: number;

    type: number;
};

export default class RenderObject {
    public x: number;
    public y: number;
    public z: number;

    public width: number;
    public height: number;
    public scaleX: number;
    public scaleY: number;

    public id: number;
    public type: number;

    public area: Rectangle;

    constructor({ x, y, z, width, height, scaleX, scaleY, type }: TypeRenderObjectParameters = {
        x: 0, y: 0, z: 0, width: 0, height: 0, scaleX: 1, scaleY: 0, type: 0
    }) {
        if (x !== undefined) {
            this.x = x;
        }
        if (y !== undefined) {
            this.y = y;
        }
        if (z !== undefined) {
            this.z = z;
        }
    }

    destroy(): void {

    }
}