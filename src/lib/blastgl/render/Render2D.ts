import Scene from "./Scene";
import Camera2D from "./Camera2D";
import Chunk2D from "./Chunk2D";

export default class Render2D {
    // WebGl context
    private static _gl: WebGLRenderingContext;

    // Canvas
    private static _canvas: HTMLCanvasElement;

    // List of supported webgl extensions
    private static _supportedExtensions: string[] = [];

    // Need to create new chunk
    private static _isNeedToAllocateChunk: boolean = false;

    // Need to remove some elements
    private static _isNeedGarbageCollector: boolean = false;

    // Index size for index buffer
    private static _indexSize: number = 0;

    private static _currentScene: Scene;

    private static _currentCamera: Camera2D;

    private static _cameraList: Camera2D[] = [];

    private static _chunkList: Chunk2D[] = [];

    private static _width: number = 0;
    private static _height: number = 0;

    private static _resolutionDecreaseRate: number = 1;
    private static _chunkCounter: number = 0;

    public static readonly shaderList: {} = {};

    static init(element: string): void {
        // Inject canvas
        document.querySelector(element).innerHTML = `
            <canvas style="display: block;"></canvas>
            <div></div>
        `;
        this._canvas = document.querySelector(element).querySelector('canvas');

        // Инициализация WebGL
        try {
            this._gl = this._canvas.getContext("webgl", {alpha: true, antialias: false, premultipliedAlpha: true});
            this._gl.viewport(0, 0, this._canvas.width, this._canvas.height);
        } catch (e) {
            if (!this._gl) {
                alert("WebGL initialization error!");
                return;
            }
        }

        // Render settings up
        this._gl.enable(this._gl.BLEND);
        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.blendFuncSeparate(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA, this._gl.ONE, this._gl.ONE_MINUS_SRC_ALPHA);

        // Check extension for expanding index buffer
        this._indexSize = this._gl.UNSIGNED_SHORT;
        this._supportedExtensions = this._gl.getSupportedExtensions();
        if (this.extensionIsAvailable('OES_element_index_uint')) {
            this._gl.getExtension('OES_element_index_uint');
            this._indexSize = this._gl.UNSIGNED_INT;
        }
    }

    // Проверить поддержку расширения
    static extensionIsAvailable(name: string): boolean {
        return this._supportedExtensions.indexOf(name) !== -1;
    }

    private static initShaders() {

    }

    static resize(width: number, height: number): void {
        // Обновляем параметры сцены
        this._width = width / this._resolutionDecreaseRate;
        this._height = height / this._resolutionDecreaseRate;

        // Обновляем размер камеры (но не статический размер)
        this._currentCamera.width = width / this._resolutionDecreaseRate;
        this._currentCamera.height = height / this._resolutionDecreaseRate;

        // Размеры канваса
        this._canvas.setAttribute("width", (width / this._resolutionDecreaseRate).toString());
        this._canvas.setAttribute("height", (height / this._resolutionDecreaseRate).toString());

        // Обновляем вьюпорт
        this._gl.viewport(0, 0, width / this._resolutionDecreaseRate, height / this._resolutionDecreaseRate);

        this._canvas.style.width = width + 'px';
        this._canvas.style.height = height + 'px';
    }

    static setBackground(value) {
        // this.background = ColorHelper.HexToRGB(value);
        // this._gl.clearColor(Render2D.background[0], Render2D.background[1], Render2D.background[2], Render2D.background[3]);
    }

    static addObject(object, layerId: number) {
        if (!this._currentScene) {
            throw new Error("Can't add object to null scene");
        }
        layerId = ~~layerId;

        // Ищем слой с указанным id
        var layer = null;
        for (var i = 0; i < this._currentScene.layers.length; i++) {
            if (this._currentScene.layers[i].id === layerId) {
                layer = this._currentScene.layers[i];
                break;
            }
        }

        // Если такого слоя нет, создаем
        if (!layer) {
            layer = {id: layerId, elements: []};
            this._currentScene.layers.push(layer);
        }

        // Добавляем элемент в слой
        if (layer.elements.indexOf(object) === -1) {
            layer.elements.push(object);
        }

        // Сортируем слои по id
        this._currentScene.layers.sort(function (a, b) {
            return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);
        });

        // Указываем номер слоя у объекта
        //console.log('DIE`', object);
        object._layerId = layerId;
        object.layerPosition = this._currentScene.layers.indexOf(layer);

        // Событие создание объекта
        // Render2D.emit('objectCreated', object);
    }

    // Выделить новый чанк
    static allocateChunk(): Chunk2D {
        this._chunkCounter += 1;
        if (!this._chunkList[this._chunkCounter - 1]) {
            this._chunkList[this._chunkCounter - 1] = new Chunk2D(this._chunkCounter - 1);
        }

        return this._chunkList[this._chunkCounter - 1];
    }

    static clear(exceptionLayer: number[]): void {
        if (!exceptionLayer) {
            exceptionLayer = [];
        }
        for (let i = 0; i < this._currentScene.layers.length; i++) {
            if (exceptionLayer.indexOf(this._currentScene.layers[i].id) !== -1) {
                continue;
            }
            for (let j = 0; j < this._currentScene.layers[i].elements.length; j++) {
                this._currentScene.layers[i].elements[j].destroy();
                this._isNeedGarbageCollector = true;
            }
        }
    }

    static get gl(): WebGLRenderingContext {
        return this._gl;
    }

    static get indexSize(): number {
        return this._indexSize;
    }
}