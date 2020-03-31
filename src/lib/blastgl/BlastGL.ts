import EventEmitter from "../util/EventEmitter";
import RenderObject from "./render/RenderObject";
import Scene from "./render/Scene";
import Layer from "./render/Layer";
import Shader from "./render/Shader";

// import "./shader/image.fragment.glsl";
// import "./shader/image.vertex.glsl";

export default class BlastGL {
    private static _gl: WebGLRenderingContext;
    private static _indexSize: number;
    private static _canvas: HTMLCanvasElement;
    private static _currentScene: Scene;
    private static _shaderList: {[key: string]: Shader} = {};
    public static readonly event: EventEmitter = new EventEmitter();

    static init(element: string): void {
        // Inject canvas
        document.querySelector(element).innerHTML = `
            <canvas></canvas>  
        `;
        this._canvas = document.querySelector(element).querySelector('canvas');

        // Init webgl
        try {
            this._gl = this._canvas.getContext("webgl", {alpha: true, antialias: false, premultipliedAlpha: true});
            this._gl.viewport(0, 0, this._canvas.width, this._canvas.height);
        } catch (e) {
            if (!this._gl) {
                alert("WebGL initialization error!");
                return;
            }
        }

        // Settings up render
        this.gl.enable(this.gl.BLEND);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);

        // Index size for index buffer
        this._indexSize = this.gl.UNSIGNED_SHORT;
    }

    private static initShaders() {
        // Настройка шейдера для спрайтов
        this._shaderList['sprite2d'] = new Shader(
            'sprite2d',
            `[[[ "./shader/sprite.vertex.glsl" ]]]`,
            `[[[ "./shader/sprite.fragment.glsl" ]]]`,
        );
        this._shaderList['sprite2d'].bindAttribute('aVertexPosition');
        this._shaderList['sprite2d'].bindAttribute('aColor');
        this._shaderList['sprite2d'].bindAttribute('aTextureCoord');
        this._shaderList['sprite2d'].bindUniform('uCameraMatrix');
    }

    static setScene(scene: Scene): void {
        if (this._currentScene === scene) {
            return;
        }

        if (this._currentScene) {
            this._currentScene.destroy();
        }
        this._currentScene = scene;
        this._currentScene.init();
    }

    static addObject(object: RenderObject, layerId: number = 0): void {
        if (!this._currentScene) {
            throw new Error("Can't add object to null scene");
        }

        // Ищем слой с указанным id
        let layer = null;
        for (let i = 0; i < this._currentScene.layers.length; i++) {
            if (this._currentScene.layers[i].id === layerId) {
                layer = this._currentScene.layers[i];
                break;
            }
        }

        // Если такого слоя нет, создаем
        if (!layer) {
            layer = new Layer(layerId);
            this._currentScene.layers.push(layer);
        }

        // Добавляем элемент в слой
        if (layer.elements.indexOf(object) === -1) {
            layer.elements.push(object);
        }

        // Сортируем слои по id
        this._currentScene.layers.sort(function (a: Layer, b: Layer) {
            return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);
        });
    }

    // Очистить все слои и объекты
    static clear(exceptionLayer: number[] = []): void {
        for (let i = 0; i < this._currentScene.layers.length; i++) {
            if (exceptionLayer.indexOf(this._currentScene.layers[i].id) !== -1) {continue;}
            for (let j = 0; j < this._currentScene.layers[i].elements.length; j++) {
                this._currentScene.layers[i].elements[j].destroy();
                //this.isNeedGarbageCollector = true;
            }
        }
    }

    static get gl(): WebGLRenderingContext {
        return this._gl;
    }
}