import Material from "./Material";
import Shader from "./Shader";
import Color from "../../image/Color";
import BlastGL from "../BlastGL";

export default class SpriteMaterial extends Material {
    private readonly _aColor: Float32Array = new Float32Array([
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1
    ]);
    private readonly _finalColor: Float32Array = new Float32Array([
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1
    ]);
    public brightness: number = 1;

    constructor(blastGl: BlastGL) {
        super(blastGl);

        // Create shader
        SpriteMaterial._shader = new Shader(
            blastGl,
            'sprite2d',
             // language=GLSL
            `
                attribute vec3 aMesh;
                attribute vec2 aUV;
                attribute vec4 aColor;
                
                // Camera
                uniform mat4 uCamera;
                
                // To frag
                varying lowp vec2 vUV;
                varying lowp vec4 vColor;
                
                void main(void) {
                    gl_Position = uCamera * vec4(aMesh, 1.0);
                    vUV = aUV;
                    vColor = aColor;
                }
            `,
            // language=GLSL
            `
                precision lowp float;
                varying lowp vec2 vUV;
                varying lowp vec4 vColor;
                uniform sampler2D uTexture;
                
                void main(void) {
                    vec4 textureColor = texture2D(uTexture, vec2(vUV.x, vUV.y));
                    if (vUV.x == -1.0 && vUV.y == -1.0) gl_FragColor = vColor;
                    else gl_FragColor = textureColor * vColor;
                    
                    if (gl_FragColor.a < 0.01)
                        discard;
                }
            `,
        );

        // Bind attributes
        SpriteMaterial._shader.bindAttribute('aMesh');
        SpriteMaterial._shader.bindAttribute('aUV');
        SpriteMaterial._shader.bindAttribute('aColor');
        SpriteMaterial._shader.bindUniform('uCamera');
    }

    public get aColor(): Float32Array {
        for (let i = 0; i < this._aColor.length; i++) {
            if (i % 4 === 0) {
                continue;
            }
            this._finalColor[i] = this._aColor[i] * this.brightness;
        }
        return this._finalColor;
    }

    public get shader(): Shader {
        return SpriteMaterial._shader;
    }

    get shaderPropertyList(): { name: string; type: string; size?: number; slot?: number }[] {
        return [
            { name: 'index', type: 'index' },

            { name: 'aMesh', type: 'mesh', size: 3 },
            { name: 'aUV', type: 'uv', size: 2, slot: 0 },
            { name: 'aColor', type: 'float', size: 4 },

            { name: 'uTexture', type: 'texture', slot: 0 },
            { name: 'uCamera', type: 'camera' },
        ];
    }

    public set color(value: string) {
        if (typeof value === "string") {
            const color = Color.fromHex(value);

            this._aColor[0] = this._aColor[4] = this._aColor[8] = this._aColor[12] = color.r;
            this._aColor[1] = this._aColor[5] = this._aColor[9] = this._aColor[13] = color.g;
            this._aColor[2] = this._aColor[6] = this._aColor[10] = this._aColor[14] = color.b;
        }
    }

    public set alpha(value: number) {
        this._aColor[3] = value;
        this._aColor[7] = value;
        this._aColor[11] = value;
        this._aColor[15] = value;
    }
}