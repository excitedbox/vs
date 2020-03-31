import RenderObject from "./RenderObject";

export default class Layer {
    public id: number;
    public elements: RenderObject[];

    constructor(id: number = 0, elements: RenderObject[] = []) {
        this.id = id;
        this.elements = elements;
    }
}