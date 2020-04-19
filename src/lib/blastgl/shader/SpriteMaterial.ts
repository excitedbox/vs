import Material from "./Material";
import Shader from "./Shader";
import BlastGL from "../BlastGL";
import RenderObject from "../render/RenderObject";
import Color from "../../image/Color";

export default class SpriteMaterial extends Material {

    private readonly _vertexColor: Float32Array = new Float32Array([
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1
    ]);
    private _vertexColorBuffer: WebGLBuffer;

    constructor() {
        super();

        SpriteMaterial._shader = new Shader(
            'sprite2d',
             // language=GLSL
            `
                attribute vec3 aVertexPosition;
                attribute vec2 aTextureCoord;
                attribute vec4 aColor;
                uniform mat4 uCameraMatrix;
                varying lowp vec2 vTextureCoord;
                varying lowp vec4 vColor;
                
                void main(void) {
                    gl_Position = uCameraMatrix * vec4(aVertexPosition, 1.0);
                    vTextureCoord = aTextureCoord;
                    vColor = aColor;
                }
            `,
            // language=GLSL
            `
                precision lowp float;
                varying lowp vec2 vTextureCoord;
                varying lowp vec4 vColor;
                uniform sampler2D uSampler;
                
                void main(void) {
                    vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));
                    if (vTextureCoord.x == -1.0 && vTextureCoord.y == -1.0) gl_FragColor = vColor;
                    else gl_FragColor = textureColor * vColor;
                    
                    if (gl_FragColor.a < 0.01)
                        discard;
                }
            `,
        );

        SpriteMaterial._shader.bindAttribute('aVertexPosition');
        SpriteMaterial._shader.bindAttribute('aColor');
        SpriteMaterial._shader.bindAttribute('aTextureCoord');
        SpriteMaterial._shader.bindUniform('uCameraMatrix');

        this._vertexColorBuffer = BlastGL.renderer.gl.createBuffer();
    }

    public get shader(): Shader {
        return SpriteMaterial._shader;
    }

    public set color(value: string) {
        if (typeof value === "string") {
            const color = Color.fromHex(value);

            this._vertexColor[0] = this._vertexColor[4] = this._vertexColor[8] = this._vertexColor[12] = color.r;
            this._vertexColor[1] = this._vertexColor[5] = this._vertexColor[9] = this._vertexColor[13] = color.g;
            this._vertexColor[2] = this._vertexColor[6] = this._vertexColor[10] = this._vertexColor[14] = color.b;
        }
    }

    bind(renderObject: RenderObject): void {
        const gl = BlastGL.renderer.gl;

        // Use shader
        gl.useProgram(renderObject.material.shader.program);
        renderObject.material.shader.enableVertexAttribArray();

        // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(gl.getUniformLocation(renderObject.material.shader.program, "uSampler"), 0);
        gl.bindTexture(gl.TEXTURE_2D, renderObject.texture.texture);

        // Передаем вертексы
        gl.bindBuffer(gl.ARRAY_BUFFER, renderObject.vertexBuffer);
        gl.vertexAttribPointer(
            this.shader.getAttributeLocation('aVertexPosition'), 3,
            gl.FLOAT, false, 0, 0);

        // Текстурые координаты
        gl.bindBuffer(gl.ARRAY_BUFFER, renderObject.uvBuffer);
        gl.vertexAttribPointer(
            this.shader.getAttributeLocation('aTextureCoord'), 2,
            gl.FLOAT, false, 0, 0);

        // Color
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexColorBuffer);
        gl.bufferData(BlastGL.renderer.gl.ARRAY_BUFFER, this._vertexColor, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(this.shader.getAttributeLocation('aColor'), 4,
            gl.FLOAT, false, 0, 0);

        // Индексный буфер
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, renderObject.indexBuffer);
    }
}