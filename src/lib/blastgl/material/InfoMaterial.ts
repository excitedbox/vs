import Material from "../shader/Material";
import Shader from "../shader/Shader";
import BlastGL from "../BlastGL";

export default class InfoMaterial extends Material {
    constructor(blastGl: BlastGL) {
        super(blastGl);

        // Create shader
        if (!InfoMaterial._shader) {
            InfoMaterial._shader = new Shader(
                blastGl,
                'sprite2d',
                // language=GLSL
                    `
                        attribute vec3 aMesh;
                        attribute vec2 aUV;

                        // Camera
                        uniform mat4 uCamera;

                        // To frag
                        varying lowp vec2 vUV;
                        varying lowp vec3 vMesh;

                        void main(void) {
                            gl_Position = uCamera * vec4(aMesh, 1.0);
                            vUV = aUV;
                            vMesh = aMesh;
                        }
                `,
                // language=GLSL
                    `
                        precision lowp float;
                        varying lowp vec2 vUV;
                        varying lowp vec3 vMesh;
                        uniform sampler2D uTexture;

                        void main(void) {
                            gl_FragColor = texture2D(uTexture, vec2(vUV.x, vUV.y));
                            gl_FragColor.rgb = vMesh.zzz;

                            if (gl_FragColor.a < 0.01) {
                                discard;
                            }
                        }
                `,
            );

            // Bind attributes
            InfoMaterial._shader.bindAttribute('aMesh');
            InfoMaterial._shader.bindAttribute('aUV');
            InfoMaterial._shader.bindUniform('uCamera');
        }
    }

    public get shader(): Shader {
        return InfoMaterial._shader;
    }

    get shaderPropertyList(): { name: string; type: string; size?: number; slot?: number }[] {
        return [
            {name: 'index', type: 'index'},

            {name: 'aMesh', type: 'mesh', size: 3},
            {name: 'aUV', type: 'uv', size: 2, slot: 0},

            {name: 'uTexture', type: 'texture', slot: 0},
            {name: 'uCamera', type: 'camera'},
        ];
    }
}