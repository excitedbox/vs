import Texture from "../texture/Texture";
import ShapeObject from "./ShapeObject";
import Color from "../../image/Color";
import Material from "../shader/Material";
import BlastGL from "../BlastGL";
import Mesh from "./Mesh";
import Renderer from "../core/Renderer";

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
    public id: number;
    //public lastChunkId: number = 0;
    //public lastChunkPosition: number = 0;
    public isVisible: boolean = true;

    // Visual effects
    //public alpha: number = 1;
    //public brightness: number = 1;
    public material: Material;
    public mesh: Mesh;
    // public renderer: Renderer;

    //public vertex: Float32Array;
    /*public readonly vertexColor: Float32Array = new Float32Array([
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1
    ]); */

    /*protected _texture: Texture;

    public tempIndex: Uint16Array = new Uint16Array(1 * 6);
    public tempVertex: Float32Array = new Float32Array(1 * 12);
    public tempUv: Float32Array = new Float32Array(1 * 8);
    public readonly indexBuffer: WebGLBuffer;
    public readonly vertexBuffer: WebGLBuffer;
    public readonly uvBuffer: WebGLBuffer;*/

    constructor({ blastGl, x, y, zIndex, width, height, scaleX, scaleY, material }: TypeRenderObjectParameters) {
        super({ blastGl, x, y, zIndex, width, height, scaleX, scaleY });
        this.material = material || null;

        /*this.indexBuffer = BlastGL.renderer.gl.createBuffer();
        this.vertexBuffer = BlastGL.renderer.gl.createBuffer();
        this.uvBuffer = BlastGL.renderer.gl.createBuffer();

        this.tempIndex[0] = 0;
        this.tempIndex[1] = 1 + 0;
        this.tempIndex[2] = 2 + 0;
        this.tempIndex[3] = 0;
        this.tempIndex[4] = 2 + 0;
        this.tempIndex[5] = 3 + 0;*/

        // Сразу заливаем индексы в буфер
        // BlastGL.renderer.gl.bindBuffer(BlastGL.renderer.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        // BlastGL.renderer.gl.bufferData(BlastGL.renderer.gl.ELEMENT_ARRAY_BUFFER, this.tempIndex, BlastGL.renderer.gl.DYNAMIC_DRAW);
    }

    update(delta: number): void {
        /*this.tempVertex[0] = this.vertex[0];
        this.tempVertex[0 + 1] = this.vertex[1];
        this.tempVertex[0 + 2] = this.vertex[2];
        this.tempVertex[0 + 3] = this.vertex[3];
        this.tempVertex[0 + 4] = this.vertex[4];
        this.tempVertex[0 + 5] = this.vertex[5];
        this.tempVertex[0 + 6] = this.vertex[6];
        this.tempVertex[0 + 7] = this.vertex[7];

        this.tempVertex[0 + 8] = this.vertex[8];
        this.tempVertex[0 + 9] = this.vertex[9];
        this.tempVertex[0 + 10] = this.vertex[10];
        this.tempVertex[0 + 11] = this.vertex[11];

        this.tempUv[0] = this.texture.uv[0];
        this.tempUv[0 + 1] = this.texture.uv[1];
        this.tempUv[0 + 2] = this.texture.uv[2];
        this.tempUv[0 + 3] = this.texture.uv[3];
        this.tempUv[0 + 4] = this.texture.uv[4];
        this.tempUv[0 + 5] = this.texture.uv[5];
        this.tempUv[0 + 6] = this.texture.uv[6];
        this.tempUv[0 + 7] = this.texture.uv[7];

        BlastGL.renderer.gl.bindBuffer(BlastGL.renderer.gl.ARRAY_BUFFER, this.vertexBuffer);
        BlastGL.renderer.gl.bufferData(BlastGL.renderer.gl.ARRAY_BUFFER, this.tempVertex, BlastGL.renderer.gl.DYNAMIC_DRAW);

        BlastGL.renderer.gl.bindBuffer(BlastGL.renderer.gl.ARRAY_BUFFER, this.uvBuffer);
        BlastGL.renderer.gl.bufferData(BlastGL.renderer.gl.ARRAY_BUFFER, this.tempUv, BlastGL.renderer.gl.DYNAMIC_DRAW);*/
    }

    /*set texture(texture: Texture) {
        this._texture = texture;
    }

    get texture(): Texture {
        return this._texture;
    }*/

    /*set color(value: string) {
        if (typeof value === "string") {
            const color = Color.fromHex(value);

            this.vertexColor[0] = this.vertexColor[4] = this.vertexColor[8] = this.vertexColor[12] = color.r;
            this.vertexColor[1] = this.vertexColor[5] = this.vertexColor[9] = this.vertexColor[13] = color.g;
            this.vertexColor[2] = this.vertexColor[6] = this.vertexColor[10] = this.vertexColor[14] = color.b;
        }
    }*/
}