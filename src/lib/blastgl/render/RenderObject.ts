import Texture from "../texture/Texture";
import Shader from "../shader/Shader";
import ShapeObject from "./ShapeObject";
import BlastGL from "../BlastGL";
import Color from "../../image/Color";

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

    // Visual effects
    public alpha: number = 1;
    public brightness: number = 1;
    public shader: Shader;
    public vertex: Float32Array;
    public readonly vertexColor: Float32Array = new Float32Array([
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1
    ]); // Цвет для каждой вершины

    protected _texture: Texture;

    constructor({ x, y, zIndex, width, height, scaleX, scaleY, texture }: TypeRenderObjectParameters = {}) {
        super({ x, y, zIndex, width, height, scaleX, scaleY });
        this._texture = texture || null;
    }

    update(delta: number): void {

    }

    set texture(texture: Texture) {
        this._texture = texture;
    }

    get texture(): Texture {
        return this._texture;
    }

    set color(value: string) {
        if (typeof value === "string") {
            const color = Color.fromHex(value);

            this.vertexColor[0] = this.vertexColor[4] = this.vertexColor[8] = this.vertexColor[12] = color.r;
            this.vertexColor[1] = this.vertexColor[5] = this.vertexColor[9] = this.vertexColor[13] = color.g;
            this.vertexColor[2] = this.vertexColor[6] = this.vertexColor[10] = this.vertexColor[14] = color.b;
        }
    }
}