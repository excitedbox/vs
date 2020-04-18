import BlastGL from "../BlastGL";

export default class Shader {
    public readonly program: WebGLProgram;
    private _attributeParams: { [key: string]: number } = {};
    private _uniformParams: { [key: string]: WebGLUniformLocation } = {};

    constructor(name: string, vertex: string, fragment: string) {
        this.program = BlastGL.renderer.gl.createProgram();

        // Добавляем вершинный и фрагментый шейдеры
        this.addShader(BlastGL.renderer.gl.VERTEX_SHADER, vertex);
        this.addShader(BlastGL.renderer.gl.FRAGMENT_SHADER, fragment);

        // Линкуем шейдер
        BlastGL.renderer.gl.linkProgram(this.program);
    }

    addShader(type: number, code: string): void {
        const shader = BlastGL.renderer.gl.createShader(type);
        BlastGL.renderer.gl.shaderSource(shader, code);
        BlastGL.renderer.gl.compileShader(shader);
        if (!BlastGL.renderer.gl.getShaderParameter(shader, BlastGL.renderer.gl.COMPILE_STATUS)) {
            console.error(BlastGL.renderer.gl.getShaderInfoLog(shader));
            return;
        }
        BlastGL.renderer.gl.attachShader(this.program, shader);
    }

    // Биндим атрибуты шейдера
    bindAttribute(parameter: string): void {
        this._attributeParams[parameter] = BlastGL.renderer.gl.getAttribLocation(this.program, parameter);
    };

    // Биндим юниформ
    bindUniform(parameter: string): void {
        this._uniformParams[parameter] = BlastGL.renderer.gl.getUniformLocation(this.program, parameter);
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
            BlastGL.renderer.gl.enableVertexAttribArray(this._attributeParams[s]);
        }
    }
}