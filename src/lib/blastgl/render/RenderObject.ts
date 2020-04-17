import Texture from "../texture/Texture";
import Shader from "./Shader";
import ShapeObject from "./ShapeObject";
import BlastGL from "../BlastGL";

export type TypeRenderObjectParameters = {
    x?: number;
    y?: number;
    zIndex?: number;

    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;

    type?: number;

    texture?: Texture;
};

export default class RenderObject extends ShapeObject {
    // Info
    public id: number;
    public lastChunkId: number = 0;
    public lastChunkPosition: number = 0;
    public isVisible: boolean = true;
    public isRemoved: boolean = false;

    // Visual effects
    public alpha: number = 1;
    public brightness: number = 1;
    public shader: Shader;
    public vertex: Float32Array;
    public color: Float32Array = new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]); // Цвет для каждой вершины


    protected _texture: Texture;

    constructor({ x, y, zIndex, width, height, scaleX, scaleY, texture }: TypeRenderObjectParameters = {}) {
        super({ x, y, zIndex, width, height, scaleX, scaleY });
        this._texture = texture;
    }

    update(delta: number): void {

    }

    destroy(): void {
        this.isRemoved = true;
        BlastGL.isNeedGarbageCollector = true;
    }

    set texture(texture: Texture) {
        this._texture = texture;
    }

    get texture(): Texture {
        return this._texture;
    }
}