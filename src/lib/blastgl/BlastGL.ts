import EventEmitter from "../util/EventEmitter";
import Scene from "./scene/Scene";
import BlastGLInfo from "./util/BlastGLInfo";
import Renderer from "./core/Renderer";

export default class BlastGL {
    public readonly event: EventEmitter = new EventEmitter();
    public readonly info: BlastGLInfo = new BlastGLInfo();
    public readonly renderer: Renderer = new Renderer(this);

    private _scene: Scene;

    async setScene(scene: Scene): Promise<void> {
        if (this._scene === scene) {
            return;
        }

        if (this._scene) {
            this._scene.destroy();
        }

        this.info.sceneName = scene.constructor.name;
        this._scene = scene;
        this._scene.blastGl = this;
        await this._scene.init();
    }

    get scene(): Scene {
        return this._scene;
    }
}