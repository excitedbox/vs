import RenderObject, {TypeRenderObjectParameters} from "./RenderObject";
import BlastGL from "../BlastGL";
import Matrix2D from "../../math/geom/Matrix2D";

export default class Sprite extends RenderObject {
    public readonly matrix: Matrix2D = new Matrix2D();

    constructor(params?: TypeRenderObjectParameters) {
        super(params);

        this.vertex = new Float32Array([-0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, -0.5, 0.5, 0.0]);
        this.shader = BlastGL.shaderList['sprite2d'];
    }

    update() {
        this.matrix.identity();

        this.matrix.translate(this.x, this.y, this.z);
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
    }
}