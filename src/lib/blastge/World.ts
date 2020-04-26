import GameObject from "./GameObject";
import Scene from "../blastgl/scene/Scene";

export default class World {
    public readonly elements: GameObject[] = [];
    public readonly scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    instantiate(gameObject: Function): unknown {
        // @ts-ignore
        const element = new gameObject(this.scene);
        this.elements.push(element);
        return element;
    }

    step(delta: number): void {
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i].update(delta);
        }
    }
}