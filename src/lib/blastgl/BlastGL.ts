import EventEmitter from "../util/EventEmitter";
import Scene from "./scene/Scene";
import BlastGLInfo from "./util/BlastGLInfo";
import Renderer from "./core/Renderer";

export default class BlastGL {
    private static _scene: Scene;
    public static readonly event: EventEmitter = new EventEmitter();
    public static readonly info: BlastGLInfo = new BlastGLInfo();
    public static readonly renderer: Renderer = new Renderer();

    static setScene(scene: Scene): void {
        if (this._scene === scene) {
            return;
        }

        if (this._scene) {
            this._scene.destroy();
        }

        this._scene = scene;
        this._scene.init();
    }

    static get scene(): Scene {
        return this._scene;
    }
}