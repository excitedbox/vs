import EventEmitter from "../util/EventEmitter";
import RenderObject from "./render/RenderObject";
import Scene from "./render/Scene";
import Layer from "./render/Layer";
import Shader from "./shader/Shader";
import Camera from "./render/Camera";
import Chunk from "./render/Chunk";
import Texture from "./texture/Texture";
import BlastGLInfo from "./util/BlastGLInfo";
import TextureAtlasArea from "./texture/TextureAtlasArea";
import Rectangle from "../math/geom/Rectangle";
import Vector2D from "../math/geom/Vector2D";
import ShapeObject from "./render/ShapeObject";
import Container from "./render/Container";

export default class BlastGL {
    private static _gl: WebGLRenderingContext;
    private static _indexSize: number;
    private static _canvas: HTMLCanvasElement;
    private static _atlasContainer: HTMLElement;
    private static _currentScene: Scene;
    private static _currentCamera: Camera;
    private static _lastUsedShader: Shader;
    private static _lastUsedTexture: Texture;
    private static _chunkList: Chunk[] = [];
    private static _chunkCounter: number = 0;
    public static readonly shaderList: { [key: string]: Shader } = {};
    public static readonly event: EventEmitter = new EventEmitter();
    public static readonly info: BlastGLInfo = new BlastGLInfo();
    public static isNeedGarbageCollector: boolean = false;

    private static _resolutionDecreaseRate: number = 1;

    private static _sceneWidth: number;
    private static _sceneHeight: number;

    static init(element: string): void {
        // Inject canvas
        document.querySelector(element).innerHTML = `
            <canvas style="border: 1px solid #fefefe;"></canvas>
            <div></div>
        `;
        this._canvas = document.querySelector(element).querySelector('canvas');
        this._atlasContainer = document.querySelector(element).querySelector('div');

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

        // Set default sprite shader
        this.shaderList['sprite2d'] = new Shader(
            'sprite2d',
            `[[[ "./shader/sprite.vertex.glsl" ]]]`,
            `[[[ "./shader/sprite.fragment.glsl" ]]]`,
        );
        this.shaderList['sprite2d'].bindAttribute('aVertexPosition');
        this.shaderList['sprite2d'].bindAttribute('aColor');
        this.shaderList['sprite2d'].bindAttribute('aTextureCoord');
        this.shaderList['sprite2d'].bindUniform('uCameraMatrix');

        // Index size for index buffer
        this._indexSize = this.gl.UNSIGNED_SHORT;

        // Update timer
        setInterval(function () {
            BlastGL.update();
        }, 16);

        // Render timer
        setInterval(function () {
            BlastGL.render();
        }, 16);
    }

    static resize(width: number, height: number): void {
        // Обновляем параметры сцены
        this._sceneWidth = width / this._resolutionDecreaseRate;
        this._sceneHeight = height / this._resolutionDecreaseRate;

        // Обновляем размер камеры (но не статический размер)
        // this._currentCamera.width = width / this._resolutionDecreaseRate;
        // this._currentCamera.height = height / this._resolutionDecreaseRate;

        // Размеры канваса
        this._canvas.setAttribute("width", width / this._resolutionDecreaseRate + "");
        this._canvas.setAttribute("height", height / this._resolutionDecreaseRate + "");

        // Обновляем вьюпорт
        this.gl.viewport(0, 0, width / this._resolutionDecreaseRate, height / this._resolutionDecreaseRate);

        this._canvas.style.width = width + 'px';
        this._canvas.style.height = height + 'px';
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

    static addTexture(texture: Texture): void {
        this._currentScene.textureManager.addTexture(texture);
    }

    static allocateTextureArea(width: number, height: number): TextureAtlasArea {
        return this._currentScene.textureManager.allocateArea(width, height);
    }

    static freeTextureArea(area: TextureAtlasArea): void {
        this._currentScene.textureManager.freeArea(area);
    }

    static copyTextureData(area: Rectangle): ImageData {
        return this._currentScene.textureManager.copyTextureData(area);
    }

    static pasteTextureData(imageData: ImageData, to: Vector2D): void {
        this._currentScene.textureManager.pasteTextureData(imageData, to);
    }

    static getLayer(id: number): Layer {
        for (let i = 0; i < this._currentScene.layers.length; i++) {
            if (this._currentScene.layers[i].id === id) {
                return this._currentScene.layers[i];
            }
        }
        return null;
    }

    static addObject(object: ShapeObject, layerId: number = 0): void {
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

    static update(): void {
        this.info.tickId += 1;

        if (!this._currentScene || !this._currentCamera) {
            return;
        }

        // Update camera
        this._currentCamera.update();
        for (let i = 0; i < this._currentScene.layers.length; i++) {
            this._currentScene.layers[i].camera?.update();
        }

        // Update textures
        this._currentScene.textureManager.update();

        // Update scene if not paused
        if (!this._currentScene.isPaused) {
            this._currentScene.update(this.info.deltaTime);
        }

        // Удаляем удаленные спрайты
        if (this.isNeedGarbageCollector) {
            for (let i = 0; i < this._currentScene.layers.length; i++) {
                for (let j = 0; j < this._currentScene.layers[i].elements.length; j++) {
                    if (this._currentScene.layers[i].elements[j].isRemoved) {
                        // this._currentScene.layers[i].elements[j].free();
                        this._currentScene.layers[i].elements.splice(j, 1);
                        j -= 1;
                    }
                }
            }
        }

        for (let i = 0; i < this._currentScene.layers.length; i++) {
            for (let j = 0; j < this._currentScene.layers[i].elements.length; j++) {
                const tempElement = this._currentScene.layers[i].elements[j];
                tempElement.zIndex = -(i * 2) - (j / this._currentScene.layers[i].elements.length);

                if (tempElement.update) {
                    tempElement.update(this.info.deltaTime);
                }
            }
        }

        let lastObject = null;
        let lastTexture = null;
        let lastShader = null;
        let tempChunk: Chunk = null;
        let isNeedToAllocateChunk = true;
        this._chunkCounter = 0;

        // Проходим по всем слоям и элементам в них
        for (let i = 0; i < this._currentScene.layers.length; i++) {
            isNeedToAllocateChunk = true;

            for (let j = 0, length = this._currentScene.layers[i].elements.length + 1; j < length; j++) {
                if (length === 1) {
                    continue;
                }
                if (this._currentScene.layers[i].elements[j] && this._currentScene.layers[i].elements[j] instanceof Container) {
                    continue;
                }

                //if (this._currentScene.layers[i].elements[j] && this._currentScene.layers[i].elements[j].type === RenderObjectType.Container) {

                /*if (this._currentScene.layers[i].elements[j] && !this._currentScene.layers[i].elements[j].texture) {
                    continue;
                }
                if (lastObject && !lastObject.texture) {
                    continue;
                }*/

                // Если нужен новый чанк
                if (isNeedToAllocateChunk && (this._currentScene.layers[i].elements[j] || lastObject)) {
                    tempChunk = this.allocateChunk();
                    tempChunk.reset();
                    tempChunk.camera = this._currentScene.layers[i].camera;
                    // tempChunk.layerId = this._currentScene.layers[i].id;
                    isNeedToAllocateChunk = false;

                    // Сразу указываем материалы первого элемента
                    if (this._currentScene.layers[i].elements[j] && !lastObject) {
                        if (this._currentScene.layers[i].elements[j].texture) {
                            lastTexture = this._currentScene.layers[i].elements[j].texture.texture;
                        }
                        lastShader = this._currentScene.layers[i].elements[j].shader;
                    }

                    // Добавляем в чанк предыдущий объект
                    if (lastObject) {
                        if (lastObject.texture) {
                            tempChunk.texture = lastObject.texture.texture;
                        }
                        tempChunk.shader = lastObject.shader;
                        tempChunk.addObject(lastObject);
                        lastObject = null;
                    }
                }

                if (!this._currentScene.layers[i].elements[j]) {
                    break;
                }

                // Если чанк переполнен, или используется другая текстура или шейдер, то нужен новый чанк
                if (j > 0 && (tempChunk.size >= tempChunk.maxSize
                    || (this._currentScene.layers[i].elements[j].texture && lastTexture !== this._currentScene.layers[i].elements[j].texture.texture)
                    || lastShader !== this._currentScene.layers[i].elements[j].shader)) {
                    isNeedToAllocateChunk = true;
                    lastObject = this._currentScene.layers[i].elements[j];
                } else {
                    if (this._currentScene.layers[i].elements[j].texture) {
                        tempChunk.texture = this._currentScene.layers[i].elements[j].texture.texture;
                    }
                    tempChunk.shader = this._currentScene.layers[i].elements[j].shader;
                    tempChunk.addObject(this._currentScene.layers[i].elements[j]);
                }

                // Последние юзаемые материалы
                if (this._currentScene.layers[i].elements[j].texture) {
                    lastTexture = this._currentScene.layers[i].elements[j].texture.texture;
                }
                lastShader = this._currentScene.layers[i].elements[j].shader;

                // Если не нужно аллоцировать новый чанк, то юзаем текущие шейдеры и текстуру
                if (!isNeedToAllocateChunk) {
                    if (this._currentScene.layers[i].elements[j].texture) {
                        tempChunk.texture = this._currentScene.layers[i].elements[j].texture.texture;
                    }
                    tempChunk.shader = this._currentScene.layers[i].elements[j].shader;
                }
            }
        }

        for (let i = 0; i < this._chunkCounter; i++) {
            this._chunkList[i].prepare();
        }
        for (let i = this._chunkCounter; i < this._chunkList.length; i++) {
            this._chunkList[i].destroy();
        }
        this._chunkList.length = this._chunkCounter;

        // Set delta
        this.info.deltaTime = (performance.now() - this.info.lastFrameTime) / 16; /// 1000 / (1 / 60);
        this.info.lastFrameTime = performance.now();
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
            if (this._lastUsedTexture !== tempChunk.texture) {
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
            if (tempChunk.shader === this.shaderList['sprite2d']) {
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tempChunk.colorBuffer);
                this.gl.vertexAttribPointer(tempChunk.shader.getAttributeLocation('aColor'), 4, this.gl.FLOAT, false, 0, 0);
            }

            // Индексный буфер
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, tempChunk.indexBuffer);

            // Pass camera matrix to shader
            // We pass global camera or chunk specific camera
            this.gl.uniformMatrix4fv(tempChunk.shader.getUniformLocation('uCameraMatrix'), false, tempChunk.camera ?tempChunk.camera.matrix.matrix :this._currentCamera.matrix.matrix);

            // Отрисовка чанка
            this.gl.drawElements(this.gl.TRIANGLES, tempChunk.size * 6, this._indexSize, 0);
        }
    }

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

    static get atlasContainer(): HTMLElement {
        return this._atlasContainer;
    }
}