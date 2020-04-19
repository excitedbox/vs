import Shader from "./Shader";
import RenderObject from "../render/RenderObject";

export default class Material {
    protected static _shader: Shader;

    public get shader(): Shader {
        return Material._shader;
    }

    bind(renderObject: RenderObject): void {

    }

    get shaderPropertyList(): { name: string; type?: string; size?: number }[] {
        return [];
    }

    pullProperty(parameter: string): Float32Array {
        return this[`_${parameter}`];
    }
}