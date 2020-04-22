import ShapeObject from "./ShapeObject";
import Material from "../shader/Material";
import BlastGL from "../BlastGL";
import Mesh from "./Mesh";
import Camera from "../scene/Camera";

export type TypeRenderObjectParameters = {
    blastGl: BlastGL;

    x?: number;
    y?: number;
    zIndex?: number;

    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;

    type?: number;

    material?: Material;
};

export default class RenderObject extends ShapeObject {
    // Info
    public isVisible: boolean = true;

    // Visual effects
    protected _material: Material;
    public mesh: Mesh;

    // Which camera is looking for this object
    public camera: Camera;

    constructor({ blastGl, x, y, zIndex, width, height, scaleX, scaleY, material }: TypeRenderObjectParameters) {
        super({ blastGl, x, y, zIndex, width, height, scaleX, scaleY });
        this._material = material || null;
    }

    set material(value: Material) {
        this._material = value;
    }

    get material(): Material {
        return this._material;
    }
}