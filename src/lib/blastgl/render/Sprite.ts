import RenderObject, {TypeRenderObjectParameters} from "./RenderObject";
import BlastGL from "../BlastGL";
import Texture from "../texture/Texture";
import SpriteMaterial from "../shader/SpriteMaterial";

export default class Sprite extends RenderObject {
    constructor(params: TypeRenderObjectParameters = {}) {
        super(params);

        // Set default vertex and shader data
        this.vertex = new Float32Array([-0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, -0.5, 0.5, 0.0]);
        if (!this.material) {
            this.material = new SpriteMaterial();
        }

        // Set default size from texture
        if (params.texture) {
            this.width = params.texture.width;
            this.height = params.texture.height;
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

        this.vertex[0] = -0.5 * this.matrix.matrix[0] + -0.5 * this.matrix.matrix[4] + this.matrix.matrix[12];
        this.vertex[1] = -0.5 * this.matrix.matrix[1] + -0.5 * this.matrix.matrix[5] + this.matrix.matrix[13];
        this.vertex[2] = -0.5 * this.matrix.matrix[2] + -0.5 * this.matrix.matrix[6] + this.matrix.matrix[14];

        this.vertex[3] = 0.5 * this.matrix.matrix[0] + -0.5 * this.matrix.matrix[4] + this.matrix.matrix[12];
        this.vertex[4] = 0.5 * this.matrix.matrix[1] + -0.5 * this.matrix.matrix[5] + this.matrix.matrix[13];
        this.vertex[5] = 0.5 * this.matrix.matrix[2] + -0.5 * this.matrix.matrix[6] + this.matrix.matrix[14];

        this.vertex[6] = 0.5 * this.matrix.matrix[0] + 0.5 * this.matrix.matrix[4] + this.matrix.matrix[12];
        this.vertex[7] = 0.5 * this.matrix.matrix[1] + 0.5 * this.matrix.matrix[5] + this.matrix.matrix[13];
        this.vertex[8] = 0.5 * this.matrix.matrix[2] + 0.5 * this.matrix.matrix[6] + this.matrix.matrix[14];

        this.vertex[9] = -0.5 * this.matrix.matrix[0] + 0.5 * this.matrix.matrix[4] + this.matrix.matrix[12];
        this.vertex[10] = -0.5 * this.matrix.matrix[1] + 0.5 * this.matrix.matrix[5] + this.matrix.matrix[13];
        this.vertex[11] = -0.5 * this.matrix.matrix[2] + 0.5 * this.matrix.matrix[6] + this.matrix.matrix[14];

        // Set area info
        this.area.top = Math.max(this.vertex[1], this.vertex[4], this.vertex[7], this.vertex[10]);
        this.area.left = Math.min(this.vertex[0], this.vertex[3], this.vertex[6], this.vertex[9]);
        this.area.bottom = Math.min(this.vertex[1], this.vertex[4], this.vertex[7], this.vertex[10]);
        this.area.right = Math.max(this.vertex[0], this.vertex[3], this.vertex[6], this.vertex[9]);
    }

    set texture(value: Texture) {
        this._texture = value;
        this.width = value.width;
        this.height = value.height;
    }

    get texture(): Texture {
        return this._texture;
    }
}