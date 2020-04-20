import Shader from "./Shader";
import RenderObject from "../render/RenderObject";
import Texture from "../texture/Texture";

export default class Material {
    protected static _shader: Shader;

    protected _texture: Texture;

    public get shader(): Shader {
        return Material._shader;
    }

    bind(renderObject: RenderObject): void {

    }

    get shaderPropertyList(): { name: string; type: string; size?: number }[] {
        return [];
    }

    getProperty(parameter: string): Float32Array | Uint16Array {
        return this[`_${parameter}`];
    }

    set texture(texture: Texture) {
        this._texture = texture;
    }

    get texture(): Texture {
        return this._texture;
    }
}