import Material from "./Material";
import Shader from "./Shader";
import RenderObject from "../render/RenderObject";
import Color from "../../image/Color";
import Texture from "../texture/Texture";

export default class SpriteMaterial extends Material {

    private readonly _aColor: Float32Array = new Float32Array([
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1
    ]);

    /*private readonly _index: Uint16Array = new Uint16Array([
        0, 1, 2, 3, 4, 5
    ]);
    private readonly _aVertexPosition: Float32Array = new Float32Array([
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0,
        0.5, 0.5, 0.0,
        -0.5, 0.5, 0.0
    ]);*/
    /*private _aTextureCoord: Float32Array = new Float32Array([
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ]);*/

    constructor() {
        super();

        // Create shader
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

        // Bind attributes
        SpriteMaterial._shader.bindAttribute('aVertexPosition');
        SpriteMaterial._shader.bindAttribute('aTextureCoord');
        SpriteMaterial._shader.bindAttribute('aColor');
        SpriteMaterial._shader.bindUniform('uCameraMatrix');
    }

    set texture(texture: Texture) {
        this._texture = texture;
        // this._aTextureCoord = texture.uv;
    }

    get texture(): Texture {
        return this._texture;
    }

    public get shader(): Shader {
        return SpriteMaterial._shader;
    }

    get shaderPropertyList(): { name: string; type: string; size?: number }[] {
        return [
            { name: 'uSampler', type: 'texture' },
            { name: 'aVertexPosition', type: 'mesh', size: 3 },
            { name: 'aTextureCoord', type: 'uv', size: 2 },

            { name: 'aColor', type: 'float', size: 4 },

            { name: 'index', type: 'index' },
            { name: 'uCameraMatrix', type: 'matrix4' },
        ];
    }

    public set color(value: string) {
        if (typeof value === "string") {
            const color = Color.fromHex(value);

            /*this._vertexColor[0] = this._vertexColor[4] = this._vertexColor[8] = this._vertexColor[12] = color.r;
            this._vertexColor[1] = this._vertexColor[5] = this._vertexColor[9] = this._vertexColor[13] = color.g;
            this._vertexColor[2] = this._vertexColor[6] = this._vertexColor[10] = this._vertexColor[14] = color.b;*/
        }
    }

    bind(renderObject: RenderObject): void {
        //const gl = BlastGL.renderer.gl;

        // Use shader
        //gl.useProgram(renderObject.material.shader.program);
        //renderObject.material.shader.enableVertexAttribArray();

        // Bind texture
        /*gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(gl.getUniformLocation(renderObject.material.shader.program, "uSampler"), 0);
        gl.bindTexture(gl.TEXTURE_2D, renderObject.texture.texture);

        // Pass vertex data
        gl.bindBuffer(gl.ARRAY_BUFFER, renderObject.vertexBuffer);
        gl.vertexAttribPointer(
            this.shader.getAttributeLocation('aVertexPosition'), 3,
            gl.FLOAT, false, 0, 0);

        // Pass UV
        gl.bindBuffer(gl.ARRAY_BUFFER, renderObject.uvBuffer);
        gl.vertexAttribPointer(
            this.shader.getAttributeLocation('aTextureCoord'), 2,
            gl.FLOAT, false, 0, 0);*/

        // Color
        /*gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexColorBuffer);
        gl.bufferData(BlastGL.renderer.gl.ARRAY_BUFFER, this._vertexColor, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(this.shader.getAttributeLocation('aColor'), 4,
            gl.FLOAT, false, 0, 0);*/

        // Index buffer
        //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, renderObject.indexBuffer);

        // Pass camera matrix to shader
        /*gl.uniformMatrix4fv(
            renderObject.material.shader.getUniformLocation('uCameraMatrix'), false,
            BlastGL.scene.camera.matrix.matrix);*/
    }
}