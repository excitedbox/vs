import Rectangle from "../../math/geom/Rectangle";
import Texture from "../texture/Texture";
import Shader from "./Shader";

export type TypeRenderObjectParameters = {
    x?: number;
    y?: number;
    z?: number;

    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;

    type?: number;

    texture?: Texture;
};

export enum RenderObjectType {
    Sprite,
    Container
}

export default class RenderObject {
    public x: number;
    public y: number;
    public z: number;

    public width: number;
    public height: number;
    public scaleX: number;
    public scaleY: number;

    public id: number;
    public type: RenderObjectType;
    public vertex: Float32Array;
    public color: Float32Array = new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]); // Цвет для каждой вершины

    public alpha: number = 1;
    public brightness: number = 1;

    public texture: Texture;
    public shader: Shader;

    public lastChunkId: number = 0;
    public lastChunkPosition: number = 0;

    public isVisible: boolean = true;


    public area: Rectangle;

    constructor({ x, y, z, width, height, scaleX, scaleY, type, texture }: TypeRenderObjectParameters) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.width = width || 0;
        this.height = height || 0;
        this.scaleX = scaleX || 1;
        this.scaleY = scaleY || 1;
        this.texture = texture;
    }

    update(): void {

    }

    destroy(): void {

    }
}