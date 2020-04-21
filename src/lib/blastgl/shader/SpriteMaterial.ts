import Material from "./Material";
import Shader from "./Shader";
import BlastGL from "../BlastGL";

export default class SpriteMaterial extends Material {
    constructor(blastGl: BlastGL) {
        super(blastGl);

        // Create shader
        if (!SpriteMaterial._shader) {
            SpriteMaterial._shader = new Shader(
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

                        void main(void) {
                            gl_Position = uCamera * vec4(aMesh, 1.0);
                            vUV = aUV;
                        }
                `,
                // language=GLSL
                    `
                        precision lowp float;
                        varying lowp vec2 vUV;
                        uniform sampler2D uTexture;

                        void main(void) {
                            gl_FragColor = texture2D(uTexture, vec2(vUV.x, vUV.y));

                            if (gl_FragColor.a < 0.01)
                            discard;
                        }
                `,
            );

            // Bind attributes
            SpriteMaterial._shader.bindAttribute('aMesh');
            SpriteMaterial._shader.bindAttribute('aUV');
            SpriteMaterial._shader.bindUniform('uCamera');
        }
    }

    public get shader(): Shader {
        return SpriteMaterial._shader;
    }

    get shaderPropertyList(): { name: string; type: string; size?: number; slot?: number }[] {
        return [
            { name: 'index', type: 'index' },

            { name: 'aMesh', type: 'mesh', size: 3 },
            { name: 'aUV', type: 'uv', size: 2, slot: 0 },

            { name: 'uTexture', type: 'texture', slot: 0 },
            { name: 'uCamera', type: 'camera' },
        ];
    }
}