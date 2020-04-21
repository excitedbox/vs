import Renderer from "../core/Renderer";
import BlastGL from "../BlastGL";

export default class Shader {
    public readonly program: WebGLProgram;
    private _attributeParams: { [key: string]: number } = {};
    private _uniformParams: { [key: string]: WebGLUniformLocation } = {};
    private _blastGl: BlastGL;

    constructor(blastGl: BlastGL, name: string, vertex: string, fragment: string) {
        this._blastGl = blastGl;
        this.program = this._blastGl.renderer.gl.createProgram();

        // Добавляем вершинный и фрагментый шейдеры
        this.addShader(this._blastGl.renderer.gl.VERTEX_SHADER, vertex);
        this.addShader(this._blastGl.renderer.gl.FRAGMENT_SHADER, fragment);

        // Линкуем шейдер
        this._blastGl.renderer.gl.linkProgram(this.program);
    }

    addShader(type: number, code: string): void {
        const shader = this._blastGl.renderer.gl.createShader(type);
        this._blastGl.renderer.gl.shaderSource(shader, code);
        this._blastGl.renderer.gl.compileShader(shader);
        if (!this._blastGl.renderer.gl.getShaderParameter(shader, this._blastGl.renderer.gl.COMPILE_STATUS)) {
            console.error(this._blastGl.renderer.gl.getShaderInfoLog(shader));
            return;
        }
        this._blastGl.renderer.gl.attachShader(this.program, shader);
    }

    // Биндим атрибуты шейдера
    bindAttribute(parameter: string): void {
        this._attributeParams[parameter] = this._blastGl.renderer.gl.getAttribLocation(this.program, parameter);
    };

    // Биндим юниформ
    bindUniform(parameter: string): void {
        this._uniformParams[parameter] = this._blastGl.renderer.gl.getUniformLocation(this.program, parameter);
    };

    getAttributeLocation(parameter: string): number {
        return this._attributeParams[parameter];
    }

    getUniformLocation(parameter: string): WebGLUniformLocation {
        return this._uniformParams[parameter];
    }

    // Активируем атрибут
    enableVertexAttribArray(): void {
        for (const s in this._attributeParams) {
            if (!this._attributeParams.hasOwnProperty(s)) {
                continue;
            }
            this._blastGl.renderer.gl.enableVertexAttribArray(this._attributeParams[s]);
        }
    }
}