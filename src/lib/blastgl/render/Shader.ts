import BlastGL from "../BlastGL";

export default class Shader {
    public readonly program: WebGLProgram;
    private _bindParams: {[key: string]: number| WebGLUniformLocation} = {};

    constructor(name: string, vertex: string, fragment: string) {
        this.program = BlastGL.gl.createProgram();

        // Добавляем вершинный и фрагментый шейдеры
        this.addShader(BlastGL.gl.VERTEX_SHADER, vertex);
        this.addShader(BlastGL.gl.FRAGMENT_SHADER, fragment);

        // Линкуем шейдер
        BlastGL.gl.linkProgram(this.program);
    }

    addShader(type: number, code: string) {
        const shader = BlastGL.gl.createShader(type);
        BlastGL.gl.shaderSource(shader, code);
        BlastGL.gl.compileShader(shader);
        if (!BlastGL.gl.getShaderParameter(shader, BlastGL.gl.COMPILE_STATUS)) {
            console.error(BlastGL.gl.getShaderInfoLog(shader));
            return;
        }
        BlastGL.gl.attachShader(this.program, shader);
    }

    // Биндим атрибуты шейдера
    bindAttribute(parameter: string): void {
        this._bindParams[parameter] = BlastGL.gl.getAttribLocation(this.program, parameter);
    };

    // Биндим юниформ
    bindUniform(parameter: string): void {
        this._bindParams[parameter] = BlastGL.gl.getUniformLocation(this.program, parameter);
    };
}