import RenderObject, {TypeRenderObjectParameters} from "./RenderObject";

export default class Sprite extends RenderObject {
    constructor(params?: TypeRenderObjectParameters) {
        super(params);

        this.vertex = new Float32Array([-0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, -0.5, 0.5, 0.0]);
    }
}