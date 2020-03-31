import EventEmitter from "../util/EventEmitter";
import RenderObject from "./render/RenderObject";
import Scene from "./render/Scene";
import Layer from "./render/Layer";
import Shader from "./render/Shader";
import Camera from "./render/Camera";
import Chunk from "./render/Chunk";

export default class BlastGL {
    private static _gl: WebGLRenderingContext;
    private static _indexSize: number;
    private static _canvas: HTMLCanvasElement;
    private static _currentScene: Scene;
    private static _currentCamera: Camera;
    private static _lastUsedShader: Shader;
    private static _chunkList: Chunk[] = [];
    private static _chunkCounter: number = 0;
    private static _shaderList: { [key: string]: Shader } = {};
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

        // Init shaders
        this.initShaders();

        // Index size for index buffer
        this._indexSize = this.gl.UNSIGNED_SHORT;

        // Таймер обновления
        setInterval(function () {
            BlastGL.calculate();
        }, 16);

        // Таймер рендера
        setInterval(function () {
            BlastGL.render();
        }, 16);
    }

    private static initShaders(): void {
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

    static setCamera(camera: Camera): void {
        this._currentCamera = camera;
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

    static calculate(): void {
        if (!this._currentScene || !this._currentCamera) {
            return;
        }

        this._currentCamera.update();
        this._currentScene.update();

        for (let i = 0; i < this._currentScene.layers.length; i++) {
            for (let j = 0; j < this._currentScene.layers[i].elements.length; j++) {
                const tempElement = this._currentScene.layers[i].elements[j];

                if (tempElement.update) {
                    tempElement.update();
                }
            }
        }
    }

    static allocateChunk(): Chunk {
        this._chunkCounter += 1;
        if (!this._chunkList[this._chunkCounter - 1]) {
            this._chunkList[this._chunkCounter - 1] = new Chunk(this._chunkCounter - 1);
        }

        return this._chunkList[this._chunkCounter - 1];
    }

    static render(): void {
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
        this.gl.clearDepth(1.0);

        for (let i = 0; i < this._chunkCounter; i++) {
            const tempChunk = this._chunkList[i];

            // Линкуем шейдер если нужно
            if (this._lastUsedShader !== tempChunk.shader) {
                this.gl.useProgram(tempChunk.shader.program);
                tempChunk.shader.enableVertexAttribArray();
            }

            // Передаем текстуру в шейдер если нужно
            if (this._lastUsedShader !== tempChunk.texture) {
                this.gl.activeTexture(this.gl.TEXTURE0);
                this.gl.uniform1i(this.gl.getUniformLocation(tempChunk.shader.program, "uSampler"), 0);
            }

            // Биндим текстуру, если текстуры нет, берем текстуру атласа
            this.gl.bindTexture(this.gl.TEXTURE_2D, tempChunk.texture);

            // Передаем вертексы
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tempChunk.vertexBuffer);
            this.gl.vertexAttribPointer(tempChunk.shader.getAttributeLocation('aVertexPosition'), 3, this.gl.FLOAT, false, 0, 0);

            // Текстурые координаты
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tempChunk.uvBuffer);
            this.gl.vertexAttribPointer(tempChunk.shader.getAttributeLocation('aTextureCoord'), 2, this.gl.FLOAT, false, 0, 0);

            // Цвет если спрайт
            if (tempChunk.shader === this._shaderList['sprite2d']) {
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tempChunk.colorBuffer);
                this.gl.vertexAttribPointer(tempChunk.shader.getAttributeLocation('aColor'), 4, this.gl.FLOAT, false, 0, 0);
            }

            // Индексный буфер
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, tempChunk.indexBuffer);

            // Передаем камеру в шейдер
            this.gl.uniformMatrix4fv(tempChunk.shader.getUniformLocation('uCameraMatrix'), false, this._currentCamera.matrix.matrix);

            // Отрисовка чанка
            this.gl.drawElements(this.gl.TRIANGLES, tempChunk.size * 6, this._indexSize, 0);
        }
    }

    // Очистить все слои и объекты
    static clear(exceptionLayer: number[] = []): void {
        for (let i = 0; i < this._currentScene.layers.length; i++) {
            if (exceptionLayer.indexOf(this._currentScene.layers[i].id) !== -1) {
                continue;
            }
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