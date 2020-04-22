import RenderObject, {TypeRenderObjectParameters} from "./RenderObject";
import SpriteMaterial from "../material/SpriteMaterial";
import Mesh from "./Mesh";
import Texture from "../texture/Texture";

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
            [
                new Float32Array([
                    0.0, 0.0,
                    1.0, 0.0,
                    1.0, 1.0,
                    0.0, 1.0
                ])
            ]
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

        // Update texture
        /*if (this.material.textureList[0]) {
            this.width = this.material.textureList[0].width;
            this.height = this.material.textureList[0].height;
        }*/

        // Set uv for textures
        for (let i = 0; i < this.material.textureList.length; i++) {
            if (this.material.textureList[i]) {
                this.mesh.uv[i] = this.material.textureList[i].uv;
            }
        }

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

        // console.log(this.zIndex);
        // console.log(this.mesh.vertex[2]);

        // Set area info
        this.area.top = Math.max(this.mesh.vertex[1], this.mesh.vertex[4], this.mesh.vertex[7], this.mesh.vertex[10]);
        this.area.left = Math.min(this.mesh.vertex[0], this.mesh.vertex[3], this.mesh.vertex[6], this.mesh.vertex[9]);
        this.area.bottom = Math.min(this.mesh.vertex[1], this.mesh.vertex[4], this.mesh.vertex[7], this.mesh.vertex[10]);
        this.area.right = Math.max(this.mesh.vertex[0], this.mesh.vertex[3], this.mesh.vertex[6], this.mesh.vertex[9]);

        const cameraWidth = (this.camera?.width || 0) / (this.camera?.zoom || 1);
        const cameraHeight = (this.camera?.height || 0) / (this.camera?.zoom || 1);
        const cameraX = (this.camera?.x || 0);
        const cameraY = (this.camera?.y || 0);

        // console.log(this.area);
        this.mesh.uv[16] = new Float32Array([
            (this.area.left + cameraX + cameraWidth / 2) / cameraWidth, (this.area.bottom + cameraY + cameraHeight / 2) / cameraHeight,
            (this.area.right + cameraX + cameraWidth / 2) / cameraWidth, (this.area.bottom + cameraY + cameraHeight / 2) / cameraHeight,
            (this.area.right + cameraX + cameraWidth / 2) / cameraWidth, (this.area.top + cameraY + cameraHeight / 2) / cameraHeight,
            (this.area.left + cameraX + cameraWidth / 2) / cameraWidth, (this.area.top + cameraY + cameraHeight / 2) / cameraHeight
            /*(this.x - this.width / 2) / 720, 1 - this.area.top / (480 ),
            (this.x + this.width / 2) / 720, 1 - this.area.top / (480),
            (this.x + this.width / 2) / 720, 1 - this.area.bottom / (480 ),
            (this.x - this.width / 2) / 720, 1 - this.area.bottom / (480 ),*/

            /*this.x / (720 / 2), 1 - (this.y + this.height) / (480 / 2),
            (this.x + this.width) / (720 / 2), 1 - (this.y + this.height) / (480 / 2),
            (this.x + this.width) / (720 / 2), 1 - this.y / (480 / 2),
            this.x / (720 / 2), 1 - this.y / (480 / 2)*/
        ]);
        // console.log(this.mesh.uv[16]);
    }

    set texture(value: Texture) {
        this.material.textureList[0] = value;
        this.width = value.width;
        this.height = value.height;
        this.mesh.uv[0] = value.uv;
    }

    get material(): SpriteMaterial {
        return this._material as SpriteMaterial;
    }

    set material(value: SpriteMaterial) {
        this._material = value;
    }
}