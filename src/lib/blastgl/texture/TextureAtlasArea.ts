import Rectangle from "../../math/geom/Rectangle";
import Texture from "./Texture";
import TextureAtlas from "./TextureAtlas";

export default class TextureAtlasArea {
    public atlas: TextureAtlas;
    public atlasTexture: WebGLTexture;
    public context: CanvasRenderingContext2D;
    public area: Rectangle;

    public uv: Float32Array;
    public texture: Texture;

    constructor({atlas, atlasTexture, context, uv, area, texture}) {
        this.atlas = atlas;
        this.atlasTexture = atlasTexture;
        this.context = context;
        this.uv = uv;
        this.area = area;
        this.texture = texture;
    }
}