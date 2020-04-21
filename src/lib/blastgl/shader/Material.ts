import Shader from "./Shader";
import BlastGL from "../BlastGL";
import Texture from "../texture/Texture";

export default class Material {
    protected static _shader: Shader;
    protected _blastGl: BlastGL;

    public texture: Texture[] = [
        null, null, null, null
    ];

    constructor(blastGl: BlastGL) {
        this._blastGl = blastGl;
    }

    public get shader(): Shader {
        return Material._shader;
    }

    get shaderPropertyList(): { name: string; type: string; size?: number; slot?: number }[] {
        return [];
    }

    getProperty(parameter: string): Float32Array | Uint16Array {
        return this[parameter];
    }
}