import RenderObject from "./RenderObject";
import Layer from "./Layer";
import TextureManager from "../texture/TextureManager";

export default class Scene {
    public readonly layers: Layer[] = [];
    public readonly textureManager: TextureManager;
    public isPaused: boolean = false;

    constructor() {
        this.textureManager = new TextureManager(this.constructor.name);
    }

    init(): void {

    }

    update(delta: number): void {

    }

    destroy(): void {

    }
}