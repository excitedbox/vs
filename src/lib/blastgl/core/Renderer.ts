import Shader from "../shader/Shader";
import Texture from "../texture/Texture";
import TextureManager from "../texture/TextureManager";
import BlastGL from "../BlastGL";
import Chunk from "../scene/Chunk";
import Container from "../render/Container";

export default class Renderer {
    private _gl: WebGLRenderingContext;
    private _canvas: HTMLCanvasElement;
    private _atlasContainer: HTMLElement;
    private _sceneWidth: number;
    private _sceneHeight: number;
    private _chunkCounter: number = 0;
    private _chunkList: Chunk[] = [];
    private _lastUsedShader: Shader;
    private _lastUsedTexture: Texture;
    private _textureManager: TextureManager;
    public readonly shaderList: { [key: string]: Shader } = {};

    init(element: string): void {
        // Inject canvas
        document.querySelector(element).innerHTML = `
            <canvas style="border: 1px solid #fefefe;"></canvas>
            <div></div>
        `;

        // Set canvas
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
        this._gl.enable(this._gl.BLEND);
        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.blendFuncSeparate(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA, this._gl.ONE, this._gl.ONE_MINUS_SRC_ALPHA);

        // Set default sprite shader
        this.shaderList['sprite2d'] = new Shader(
            'sprite2d',
            `[[[ "./../shader/sprite.vertex.glsl" ]]]`,
            `[[[ "./../shader/sprite.fragment.glsl" ]]]`,
        );
        this.shaderList['sprite2d'].bindAttribute('aVertexPosition');
        this.shaderList['sprite2d'].bindAttribute('aColor');
        this.shaderList['sprite2d'].bindAttribute('aTextureCoord');
        this.shaderList['sprite2d'].bindUniform('uCameraMatrix');

        // Set texture manager
        this._textureManager = new TextureManager('main');

        // Update timer
        setInterval(() => {
            this.update();
        }, 16);

        // Render timer
        setInterval(() => {
            this.draw();
        }, 16);
    }

    resize(width: number, height: number): void {
        // Set scene size
        this._sceneWidth = width;
        this._sceneHeight = height;

        // Set canvas size attribute
        this._canvas.setAttribute("width", width + "");
        this._canvas.setAttribute("height", height + "");

        // Update viewport
        this._gl.viewport(0, 0, width, height);

        // Set canvas style size
        this._canvas.style.width = width + 'px';
        this._canvas.style.height = height + 'px';
    }

    update(): void {
        BlastGL.info.tickId += 1;

        if (!BlastGL.scene) {
            return;
        }

        if (!BlastGL.scene.camera) {
            return;
        }

        // Update textures
        this._textureManager.update();

        // Update scene if not paused
        if (!BlastGL.scene.isPaused) {
            BlastGL.scene.update(BlastGL.info.deltaTime);
        }

        let lastObject = null;
        let lastTexture = null;
        let lastShader = null;
        let tempChunk: Chunk = null;
        let isNeedToAllocateChunk = true;
        this._chunkCounter = 0;

        // Проходим по всем слоям и элементам в них
        for (let i = 0; i < BlastGL.scene.layers.length; i++) {
            isNeedToAllocateChunk = true;

            for (let j = 0, length = BlastGL.scene.layers[i].elements.length + 1; j < length; j++) {
                if (length === 1) {
                    continue;
                }
                if (BlastGL.scene.layers[i].elements[j] && BlastGL.scene.layers[i].elements[j] instanceof Container) {
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
                if (isNeedToAllocateChunk && (BlastGL.scene.layers[i].elements[j] || lastObject)) {
                    tempChunk = this.allocateChunk();
                    tempChunk.reset();
                    tempChunk.camera = BlastGL.scene.layers[i].camera;
                    // tempChunk.layerId = this._currentScene.layers[i].id;
                    isNeedToAllocateChunk = false;

                    // Сразу указываем материалы первого элемента
                    if (BlastGL.scene.layers[i].elements[j] && !lastObject) {
                        if (BlastGL.scene.layers[i].elements[j].texture) {
                            lastTexture = BlastGL.scene.layers[i].elements[j].texture.texture;
                        }
                        lastShader = BlastGL.scene.layers[i].elements[j].shader;
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

                if (!BlastGL.scene.layers[i].elements[j]) {
                    break;
                }

                // Если чанк переполнен, или используется другая текстура или шейдер, то нужен новый чанк
                if (j > 0 && (tempChunk.size >= tempChunk.maxSize
                    || (BlastGL.scene.layers[i].elements[j].texture && lastTexture !== BlastGL.scene.layers[i].elements[j].texture.texture)
                    || lastShader !== BlastGL.scene.layers[i].elements[j].shader)) {
                    isNeedToAllocateChunk = true;
                    lastObject = BlastGL.scene.layers[i].elements[j];
                } else {
                    if (BlastGL.scene.layers[i].elements[j].texture) {
                        tempChunk.texture = BlastGL.scene.layers[i].elements[j].texture.texture;
                    }
                    tempChunk.shader = BlastGL.scene.layers[i].elements[j].shader;
                    tempChunk.addObject(BlastGL.scene.layers[i].elements[j]);
                }

                // Последние юзаемые материалы
                if (BlastGL.scene.layers[i].elements[j].texture) {
                    lastTexture = BlastGL.scene.layers[i].elements[j].texture.texture;
                }
                lastShader = BlastGL.scene.layers[i].elements[j].shader;

                // Если не нужно аллоцировать новый чанк, то юзаем текущие шейдеры и текстуру
                if (!isNeedToAllocateChunk) {
                    if (BlastGL.scene.layers[i].elements[j].texture) {
                        tempChunk.texture = BlastGL.scene.layers[i].elements[j].texture.texture;
                    }
                    tempChunk.shader = BlastGL.scene.layers[i].elements[j].shader;
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
        BlastGL.info.deltaTime = (performance.now() - BlastGL.info.lastFrameTime) / 16; /// 1000 / (1 / 60);
        BlastGL.info.lastFrameTime = performance.now();
    }

    private allocateChunk(): Chunk {
        this._chunkCounter += 1;
        if (!this._chunkList[this._chunkCounter - 1]) {
            this._chunkList[this._chunkCounter - 1] = new Chunk(this._chunkCounter - 1);
        }

        return this._chunkList[this._chunkCounter - 1];
    }

    draw(): void {
        this._gl.clear(this._gl.DEPTH_BUFFER_BIT | this._gl.COLOR_BUFFER_BIT);
        this._gl.clearDepth(1.0);

        for (let i = 0; i < this._chunkCounter; i++) {
            const tempChunk = this._chunkList[i];

            // Линкуем шейдер если нужно
            if (this._lastUsedShader !== tempChunk.shader) {
                this._gl.useProgram(tempChunk.shader.program);
                tempChunk.shader.enableVertexAttribArray();
            }

            // Передаем текстуру в шейдер если нужно
            // Биндим текстуру, если текстуры нет, берем текстуру атласа
            if (this._lastUsedTexture !== tempChunk.texture) {
                this._gl.activeTexture(this._gl.TEXTURE0);
                this._gl.uniform1i(this._gl.getUniformLocation(tempChunk.shader.program, "uSampler"), 0);
            }

            this._gl.bindTexture(this._gl.TEXTURE_2D, tempChunk.texture);

            // Передаем вертексы
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, tempChunk.vertexBuffer);
            this._gl.vertexAttribPointer(tempChunk.shader.getAttributeLocation('aVertexPosition'), 3, this._gl.FLOAT, false, 0, 0);

            // Текстурые координаты
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, tempChunk.uvBuffer);
            this._gl.vertexAttribPointer(tempChunk.shader.getAttributeLocation('aTextureCoord'), 2, this._gl.FLOAT, false, 0, 0);

            // Цвет если спрайт
            if (tempChunk.shader === this.shaderList['sprite2d']) {
                this._gl.bindBuffer(this._gl.ARRAY_BUFFER, tempChunk.colorBuffer);
                this._gl.vertexAttribPointer(tempChunk.shader.getAttributeLocation('aColor'), 4, this._gl.FLOAT, false, 0, 0);
            }

            // Индексный буфер
            this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, tempChunk.indexBuffer);

            // Pass camera matrix to shader
            // We pass global camera or chunk specific camera
            this._gl.uniformMatrix4fv(tempChunk.shader.getUniformLocation('uCameraMatrix'), false, tempChunk.camera ?tempChunk.camera.matrix.matrix :BlastGL.scene.camera.matrix.matrix);

            // Отрисовка чанка
            this._gl.drawElements(this._gl.TRIANGLES, tempChunk.size * 6, this._gl.UNSIGNED_SHORT, 0);
        }
    }

    get gl(): WebGLRenderingContext {
        return this._gl;
    }

    get atlasContainer(): HTMLElement {
        return this._atlasContainer;
    }

    get textureManager(): TextureManager {
        return this._textureManager;
    }
}