import TextureManager from "../texture/TextureManager";
import BlastGL from "../BlastGL";
import Chunk from "../scene/Chunk";
import Sprite from "../render/Sprite";
import Camera from "../scene/Camera";

export default class Renderer {
    private _gl: WebGLRenderingContext;
    private _canvas: HTMLCanvasElement;
    private _atlasContainer: HTMLElement;
    private _sceneWidth: number;
    private _sceneHeight: number;
    private _textureManager: TextureManager;
    private readonly _blastGl: BlastGL;
    private _gasChunk: Chunk;
    private _gasSpr: Sprite;

    constructor(blastGl: BlastGL) {
        this._blastGl = blastGl;
    }

    init(element: string): void {
        // Inject canvas
        document.querySelector(element).innerHTML = `
            <canvas style="border: 1px solid #fefefe; image-rendering: pixelated;"></canvas>
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

        // Set texture manager
        this._textureManager = new TextureManager(this._blastGl, 'main');

        // Update timer
        setInterval(() => {
            this.update();
        }, 16);

        // Render timer
        setInterval(() => {
            this.draw();
        }, 16);

        this._gasChunk = new Chunk(this._blastGl, 0);
        this._gasSpr = new Sprite({
            blastGl: this._blastGl
        });
        this._gasChunk.material = this._gasSpr.material;
        this._gasChunk.camera = new Camera(720, 480);
        this._gasChunk.camera.update();
        this._gasChunk.addObject(this._gasSpr);
    }

    resize(width: number, height: number, scale: number = 1): void {
        // Set scene size
        this._sceneWidth = width / scale;
        this._sceneHeight = height / scale;

        // Set canvas size attribute
        this._canvas.setAttribute("width", width / scale + "");
        this._canvas.setAttribute("height", height / scale + "");

        // Update viewport
        this._gl.viewport(0, 0, width / scale, height / scale);

        // Set canvas style size
        this._canvas.style.width = width + 'px';
        this._canvas.style.height = height + 'px';
    }

    update(): void {
        this._blastGl.info.tickId += 1;

        if (!this._blastGl.scene) {
            return;
        }

        if (!this._blastGl.scene.camera) {
            return;
        }

        // Update textures
        this._textureManager.update();

        // Update scene if not paused
        if (!this._blastGl.scene.isPaused) {
            this._blastGl.scene.update(this._blastGl.info.deltaTime);
        }

        // Split elements to chunks
        /*let tempChunk: Chunk = null;
        let isNeedToAllocateChunk = true;
        let lastObject: RenderObject = null;
        let lastShader: Shader = null;*/
        // let lastTexture: WebGLTexture = null;
        // let lastMaterial: Material = null;

        /*for (let i = 0; i < this._blastGl.scene.layers.length; i++) {
            // We need chunk for each layer
            isNeedToAllocateChunk = true;

            for (let j = 0, length = this._blastGl.scene.layers[i].elements.length + 1; j < length; j++) {
                if (length === 1) {
                    continue;
                }

                // If need new chunk
                if (isNeedToAllocateChunk && (this._blastGl.scene.layers[i].elements[j] || lastObject)) {
                    tempChunk = this.allocateChunk();
                    tempChunk.reset();
                    tempChunk.camera = this._blastGl.scene.layers[i].camera || this._blastGl.scene.camera;
                    isNeedToAllocateChunk = false;

                    // Сразу указываем материалы первого элемента
                    if (this._blastGl.scene.layers[i].elements[j] && !lastObject) {
                        lastShader = this._blastGl.scene.layers[i].elements[j].material.shader;
                    }

                    // Добавляем в чанк предыдущий объект
                    if (lastObject !== null) {
                        if (lastObject.material) {
                            tempChunk.material = lastObject.material;
                        }
                        tempChunk.material = lastObject.material;
                        tempChunk.addObject(lastObject);
                        lastObject = null;
                    }
                }
            }
        }*/

        //console.time('x');
        /*for (let i = 0; i < this._chunkCounter; i++) {
            this._chunkList[i].build();
        }*/
        //console.timeEnd('x');

        /*
        let lastObject: RenderObject = null;
        let lastTexture: WebGLTexture = null;
        let lastMaterial: Material = null;
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

                // Если нужен новый чанк
                if (isNeedToAllocateChunk && (BlastGL.scene.layers[i].elements[j] || lastObject)) {
                    tempChunk = this.allocateChunk();
                    tempChunk.reset();
                    tempChunk.camera = BlastGL.scene.layers[i].camera;
                    tempChunk.layerId = BlastGL.scene.layers[i].id;
                    isNeedToAllocateChunk = false;

                    // Сразу указываем материалы первого элемента
                    if (BlastGL.scene.layers[i].elements[j] && !lastObject) {
                        if (BlastGL.scene.layers[i].elements[j].texture) {
                            lastTexture = BlastGL.scene.layers[i].elements[j].texture.texture;
                        }
                        lastMaterial = BlastGL.scene.layers[i].elements[j].material;
                    }

                    // Добавляем в чанк предыдущий объект
                    if (lastObject) {
                        if (lastObject.texture) {
                            tempChunk.texture = lastObject.texture.texture;
                        }
                        tempChunk.material = lastObject.material;
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
                    || lastMaterial !== BlastGL.scene.layers[i].elements[j].material)) {
                    isNeedToAllocateChunk = true;
                    lastObject = BlastGL.scene.layers[i].elements[j];
                } else {
                    if (BlastGL.scene.layers[i].elements[j].texture) {
                        tempChunk.texture = BlastGL.scene.layers[i].elements[j].texture.texture;
                    }
                    tempChunk.material = BlastGL.scene.layers[i].elements[j].material;
                    tempChunk.addObject(BlastGL.scene.layers[i].elements[j]);
                }

                // Последние юзаемые материалы
                if (BlastGL.scene.layers[i].elements[j].texture) {
                    lastTexture = BlastGL.scene.layers[i].elements[j].texture.texture;
                }
                lastMaterial = BlastGL.scene.layers[i].elements[j].material;

                // Если не нужно аллоцировать новый чанк, то юзаем текущие шейдеры и текстуру
                if (!isNeedToAllocateChunk) {
                    if (BlastGL.scene.layers[i].elements[j].texture) {
                        tempChunk.texture = BlastGL.scene.layers[i].elements[j].texture.texture;
                    }
                    tempChunk.material = BlastGL.scene.layers[i].elements[j].material;
                }
            }
        }

        for (let i = 0; i < this._chunkCounter; i++) {
            this._chunkList[i].prepare();
        }
        for (let i = this._chunkCounter; i < this._chunkList.length; i++) {
            this._chunkList[i].destroy();
        }
        this._chunkList.length = this._chunkCounter;*/

        // Set delta
        this._blastGl.info.deltaTime = (performance.now() - this._blastGl.info.lastFrameTime) / 16; /// 1000 / (1 / 60);
        this._blastGl.info.lastFrameTime = performance.now();
    }

    /*registerObject(object: RenderObject): void {
        let isFound = false;
        let chunk: Chunk;

        // console.time('a');

        for (let i = 0; i < this._chunkList.length; i++) {
            chunk = this._chunkList[i];
            isFound = true;

            // Check shader
            if (chunk.material.shader !== object.material.shader) {
                isFound = false;
                continue;
            }
        }

        if (!isFound) {
            chunk = this.allocateChunk();
            chunk.camera = this._blastGl.scene.camera;
            chunk.material = object.material;
            chunk.addObject(object);
        } else {
            chunk.addObject(object);
        }

        // console.timeEnd('a');
        // console.log(chunk);
    }

    unRegisterObject(object: RenderObject): void {

    }*/

    /*private allocateChunk(): Chunk {
        this._chunkCounter += 1;
        if (!this._chunkList[this._chunkCounter - 1]) {
            this._chunkList[this._chunkCounter - 1] = new Chunk(this._blastGl, this._chunkCounter - 1);
        }

        return this._chunkList[this._chunkCounter - 1];
    }*/

    draw(): void {
        const gl = this.gl;

        // Render to buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._blastGl.scene.fb);
        gl.bindTexture(gl.TEXTURE_2D, this._blastGl.scene.tt.texture);

        // Clear buffer
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.clearDepth(1.0);

        // Draw current scene
        if (this._blastGl.scene) {
            this._blastGl.scene.draw();
        }

        // Render to the canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // Clear canvas
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.clearDepth(1.0);

        // Draw final
        this._gasSpr.texture = this._blastGl.scene.tt; // !this._blastGl.scene.gag ?this._blastGl.scene.tt2 :this._blastGl.scene.tt;
        this._gasSpr.update(0);
        this._gasChunk.build();
        this._gasChunk.draw();

        this._blastGl.scene.gag = !this._blastGl.scene.gag;

        // console.log(this._gasChunk);
        /*for (let i = 0; i < this._blastGl.s; i++) {
            const chunk = this._chunkList[i];
            chunk.draw();
        }*/

        // console.log(this._chunkList[0]);
        // Проходим по всем слоям и элементам в них
        /*for (let i = 0; i < BlastGL.scene.layers.length; i++) {
            for (let j = 0; j < BlastGL.scene.layers[i].elements.length; j++) {
                // Get element
                const element = BlastGL.scene.layers[i].elements[j];

                // Bind material buffers
                element.material.bind(element);

                // Отрисовка чанка
                this._gl.drawElements(this._gl.TRIANGLES, 6, this._gl.UNSIGNED_SHORT, 0);
            }
        }*/

        /*for (let i = 0; i < this._chunkCounter; i++) {
            const tempChunk = this._chunkList[i];

            // Линкуем шейдер если нужно
            if (this._lastUsedMaterial !== tempChunk.material) {
                this._gl.useProgram(tempChunk.material.shader.program);
                tempChunk.material.shader.enableVertexAttribArray();
            }

            // Передаем текстуру в шейдер если нужно
            // Биндим текстуру, если текстуры нет, берем текстуру атласа
            if (this._lastUsedTexture !== tempChunk.texture) {
                this._gl.activeTexture(this._gl.TEXTURE0);
                this._gl.uniform1i(this._gl.getUniformLocation(tempChunk.material.shader.program, "uSampler"), 0);
            }

            this._gl.bindTexture(this._gl.TEXTURE_2D, tempChunk.texture);

            // Передаем вертексы
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, tempChunk.vertexBuffer);
            this._gl.vertexAttribPointer(tempChunk.material.shader.getAttributeLocation('aVertexPosition'), 3, this._gl.FLOAT, false, 0, 0);

            // Текстурые координаты
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, tempChunk.uvBuffer);
            this._gl.vertexAttribPointer(tempChunk.material.shader.getAttributeLocation('aTextureCoord'), 2, this._gl.FLOAT, false, 0, 0);

            // Цвет если спрайт
            if (tempChunk.material === this._defaultSpriteMaterial) {
                this._gl.bindBuffer(this._gl.ARRAY_BUFFER, tempChunk.colorBuffer);
                this._gl.vertexAttribPointer(tempChunk.material.shader.getAttributeLocation('aColor'), 4, this._gl.FLOAT, false, 0, 0);
            }

            // Bind material buffers
            tempChunk.material.bind();

            // Индексный буфер
            this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, tempChunk.indexBuffer);

            // Pass camera matrix to shader
            // We pass global camera or chunk specific camera
            this._gl.uniformMatrix4fv(tempChunk.material.shader.getUniformLocation('uCameraMatrix'), false, tempChunk.camera ?tempChunk.camera.matrix.matrix :BlastGL.scene.camera.matrix.matrix);

            // Отрисовка чанка
            this._gl.drawElements(this._gl.TRIANGLES, tempChunk.size * 6, this._gl.UNSIGNED_SHORT, 0);
        }*/
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