import RenderObject from "./RenderObject";
import Camera from "./Camera";

export default class Layer {
    public id: number;
    public elements: RenderObject[];
    public camera: Camera;

    constructor(id: number = 0, elements: RenderObject[] = []) {
        this.id = id;
        this.elements = elements;
    }
}