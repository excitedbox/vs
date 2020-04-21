import RenderObject, {TypeRenderObjectParameters} from "./RenderObject";
import Texture from "../texture/Texture";
import SpriteMaterial from "../shader/SpriteMaterial";
import Mesh from "./Mesh";

export default class Sprite extends RenderObject {
    constructor(params: TypeRenderObjectParameters) {
        super(params);

        // Set default mesh
        this.mesh = new Mesh(
            new Uint16Array([
                0, 1, 2, 0, 2, 3
            ]),
            new Float32Array([
                -0.5, -0.5, 0.0,
                0.5, -0.5, 0.0,
                0.5, 0.5, 0.0,
                -0.5, 0.5, 0.0
            ]),
            new Float32Array([
                1.0, 0.0,
                0.0, 0.0,
                0.0, 1.0,
                1.0, 1.0
            ])
        );

        // Set default material
        if (!this._material) {
            this._material = new SpriteMaterial(this.blastGl);
        }

        // Set area
        this.calculateMatrix();
    }

    update(delta: number): void {
        if (this.isRemoved) {
            return;
        }

        this.calculateMatrix();
        super.update(delta);
    }

    calculateMatrix(): void {
        this.matrix.identity();
        if (this.parent) {
            this.matrix.concat(this.parent.matrix);
        }

        this.matrix.translate(this.x, this.y, this.zIndex);
        this.matrix.rotate(-this.rotation);
        this.matrix.scale((this.width * this.scaleX), (this.height * this.scaleY), 1);

        this.mesh.vertex[0] = -0.5 * this.matrix.matrix[0] + -0.5 * this.matrix.matrix[4] + this.matrix.matrix[12];
        this.mesh.vertex[1] = -0.5 * this.matrix.matrix[1] + -0.5 * this.matrix.matrix[5] + this.matrix.matrix[13];
        this.mesh.vertex[2] = -0.5 * this.matrix.matrix[2] + -0.5 * this.matrix.matrix[6] + this.matrix.matrix[14];

        this.mesh.vertex[3] = 0.5 * this.matrix.matrix[0] + -0.5 * this.matrix.matrix[4] + this.matrix.matrix[12];
        this.mesh.vertex[4] = 0.5 * this.matrix.matrix[1] + -0.5 * this.matrix.matrix[5] + this.matrix.matrix[13];
        this.mesh.vertex[5] = 0.5 * this.matrix.matrix[2] + -0.5 * this.matrix.matrix[6] + this.matrix.matrix[14];

        this.mesh.vertex[6] = 0.5 * this.matrix.matrix[0] + 0.5 * this.matrix.matrix[4] + this.matrix.matrix[12];
        this.mesh.vertex[7] = 0.5 * this.matrix.matrix[1] + 0.5 * this.matrix.matrix[5] + this.matrix.matrix[13];
        this.mesh.vertex[8] = 0.5 * this.matrix.matrix[2] + 0.5 * this.matrix.matrix[6] + this.matrix.matrix[14];

        this.mesh.vertex[9] = -0.5 * this.matrix.matrix[0] + 0.5 * this.matrix.matrix[4] + this.matrix.matrix[12];
        this.mesh.vertex[10] = -0.5 * this.matrix.matrix[1] + 0.5 * this.matrix.matrix[5] + this.matrix.matrix[13];
        this.mesh.vertex[11] = -0.5 * this.matrix.matrix[2] + 0.5 * this.matrix.matrix[6] + this.matrix.matrix[14];

        // Set area info
        this.area.top = Math.max(this.mesh.vertex[1], this.mesh.vertex[4], this.mesh.vertex[7], this.mesh.vertex[10]);
        this.area.left = Math.min(this.mesh.vertex[0], this.mesh.vertex[3], this.mesh.vertex[6], this.mesh.vertex[9]);
        this.area.bottom = Math.min(this.mesh.vertex[1], this.mesh.vertex[4], this.mesh.vertex[7], this.mesh.vertex[10]);
        this.area.right = Math.max(this.mesh.vertex[0], this.mesh.vertex[3], this.mesh.vertex[6], this.mesh.vertex[9]);
    }

    set texture(value: Texture) {
        this.material.texture[0] = value;
        this.width = value.width;
        this.height = value.height;
        this.mesh.uv = value.uv;
    }

    get texture(): Texture {
        return this.material.texture[0];
    }

    get material(): SpriteMaterial {
        return this._material as SpriteMaterial;
    }
}