import Render2D from "./Render2D";

export default class Chunk2D {
    public readonly id: number;
    public size: number = 0;
    public triangles: number = 0;
    public maxSize: number = 4096;

    public  indexBuffer: WebGLBuffer;
    public  vertexBuffer: WebGLBuffer;
    public  uvBuffer: WebGLBuffer;
    public  colorBuffer: WebGLBuffer;
    public  matrixOneBuffer: WebGLBuffer;
    public  matrixTwoBuffer: WebGLBuffer;

    public  tempIndex: Uint32Array | Uint16Array;
    public  tempVertex: Float32Array;
    public  tempUv: Float32Array;
    public  tempColor: Float32Array;
    public  tempMatrixOne: Float32Array;
    public  tempMatrixTwo: Float32Array;

    // Текущая длинна массивов
    public  indexLen = 0;
    public  vertexLen = 0;
    public  uvLen = 0;
    public  colorLen = 0;
    public  mx1Len = 0;
    public  mx2Len = 0;

    // Общая текстура и шейдер для чанка
    public  texture = null;
    public  shader = null;
    public  camera = null;

    // Состояние чанка
    public   isVertexChanged = false;
    public   isUvChanged = false;
    public   isColorChanged = false;
    public   isMx1Changed = false;
    public   isMx2Changed = false;
    public  isRemoved = false;
    public  isOrderChanged = false;
    public  isPrepared = false;
    public  isChanged = false;

    public  count = 0;

    constructor(id: number) {
        this.id = id;

        // Буферы
        this.indexBuffer = Render2D.gl.createBuffer();
        this.vertexBuffer = Render2D.gl.createBuffer();
        this.uvBuffer = Render2D.gl.createBuffer();
        this.colorBuffer = Render2D.gl.createBuffer();
        this.matrixOneBuffer = Render2D.gl.createBuffer();
        this.matrixTwoBuffer = Render2D.gl.createBuffer();

        // Массивы для буферов
        this.tempIndex = Render2D.indexSize === Render2D.gl.UNSIGNED_INT ? new Uint32Array(this.maxSize * 6) : new Uint16Array(this.maxSize * 6);
        this.tempVertex = new Float32Array(this.maxSize * 12);
        this.tempUv = new Float32Array(this.maxSize * 8);
        this.tempColor = new Float32Array(this.maxSize * 16);
        this.tempMatrixOne = new Float32Array(this.maxSize * 8);
        this.tempMatrixTwo = new Float32Array(this.maxSize * 8);

        // Текущая длинна массивов
        this.indexLen = 0;
        this.vertexLen = 0;
        this.uvLen = 0;
        this.colorLen = 0;
        this.mx1Len = 0;
        this.mx2Len = 0;

        // Общая текстура и шейдер для чанка
        this.texture = null;
        this.shader = null;
        this.camera = null;

        // Состояние чанка
        this.isVertexChanged = false;
        this.isUvChanged = false;
        this.isColorChanged = false;
        this.isMx1Changed = false;
        this.isMx2Changed = false;
        this.isRemoved = false;
        this.isOrderChanged = false;
        this.isPrepared = false;

        // Индексы должны быть всегда одинаковые, так как это 2d чанк
        this.count = 0;
        for (let i = 0; i < this.maxSize; i++) {
            const cnt = this.count * 4;
            this.tempIndex[this.indexLen] = cnt;
            this.tempIndex[this.indexLen + 1] = 1 + cnt;
            this.tempIndex[this.indexLen + 2] = 2 + cnt;
            this.tempIndex[this.indexLen + 3] = cnt;
            this.tempIndex[this.indexLen + 4] = 2 + cnt;
            this.tempIndex[this.indexLen + 5] = 3 + cnt;
            this.indexLen += 6;
            this.count += 1;
        }

        // Сразу заливаем индексы в буфер
        Render2D.gl.bindBuffer(Render2D.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        Render2D.gl.bufferData(Render2D.gl.ELEMENT_ARRAY_BUFFER, this.tempIndex, Render2D.gl.DYNAMIC_DRAW);
    }

    // Добавить объект
    addObject(renderObject) {
        if (!renderObject.isVisible) return;
        // if (renderObject.type === CONTAINER_OBJECT) return;

        // Если изменился чанк объекта или его позиция в чанке
        this.isOrderChanged = renderObject.lastChunkId !== this.id || renderObject.lastChunkPosition !== this.size;

        // Если объект поменял чанк или позицию в чанке, а так же его вертексы изменились, значит надо обновить
        this.tempVertex[this.vertexLen] = renderObject.vertex[0];
        this.tempVertex[this.vertexLen + 1] = renderObject.vertex[1];
        this.tempVertex[this.vertexLen + 2] = renderObject.vertex[2];
        this.tempVertex[this.vertexLen + 3] = renderObject.vertex[3];
        this.tempVertex[this.vertexLen + 4] = renderObject.vertex[4];
        this.tempVertex[this.vertexLen + 5] = renderObject.vertex[5];
        this.tempVertex[this.vertexLen + 6] = renderObject.vertex[6];
        this.tempVertex[this.vertexLen + 7] = renderObject.vertex[7];

        this.tempVertex[this.vertexLen + 8] = renderObject.vertex[8];
        this.tempVertex[this.vertexLen + 9] = renderObject.vertex[9];
        this.tempVertex[this.vertexLen + 10] = renderObject.vertex[10];
        this.tempVertex[this.vertexLen + 11] = renderObject.vertex[11];
        this.isVertexChanged = true;

        // Тоже самое для UV координат, правда пока UV фиксированы
        if (renderObject.texture) {
            this.tempUv[this.uvLen] = renderObject.texture.uv[0];
            this.tempUv[this.uvLen + 1] = renderObject.texture.uv[1];
            this.tempUv[this.uvLen + 2] = renderObject.texture.uv[2];
            this.tempUv[this.uvLen + 3] = renderObject.texture.uv[3];
            this.tempUv[this.uvLen + 4] = renderObject.texture.uv[4];
            this.tempUv[this.uvLen + 5] = renderObject.texture.uv[5];
            this.tempUv[this.uvLen + 6] = renderObject.texture.uv[6];
            this.tempUv[this.uvLen + 7] = renderObject.texture.uv[7];
        } else {
            this.tempUv[this.uvLen] = -1.0;
            this.tempUv[this.uvLen + 1] = -1.0;
            this.tempUv[this.uvLen + 2] = -1.0;
            this.tempUv[this.uvLen + 3] = -1.0;
            this.tempUv[this.uvLen + 4] = -1.0;
            this.tempUv[this.uvLen + 5] = -1.0;
            this.tempUv[this.uvLen + 6] = -1.0;
            this.tempUv[this.uvLen + 7] = -1.0;
        }

        this.isUvChanged = true;
        this.vertexLen += renderObject.vertex.length;
        this.uvLen += 8; // UV same length as vertex

        // Цвета только для спрайтов
        if (this.shader === Render2D.shaderList['sprite2d']) {
            this.tempColor[this.colorLen] = renderObject.color[0] * renderObject.brightness;
            this.tempColor[this.colorLen + 1] = renderObject.color[1] * renderObject.brightness;
            this.tempColor[this.colorLen + 2] = renderObject.color[2] * renderObject.brightness;
            this.tempColor[this.colorLen + 3] = renderObject.alpha;
            this.tempColor[this.colorLen + 4] = renderObject.color[4] * renderObject.brightness;
            this.tempColor[this.colorLen + 5] = renderObject.color[5] * renderObject.brightness;
            this.tempColor[this.colorLen + 6] = renderObject.color[6] * renderObject.brightness;
            this.tempColor[this.colorLen + 7] = renderObject.alpha;
            this.tempColor[this.colorLen + 8] = renderObject.color[8] * renderObject.brightness;
            this.tempColor[this.colorLen + 9] = renderObject.color[9] * renderObject.brightness;
            this.tempColor[this.colorLen + 10] = renderObject.color[10] * renderObject.brightness;
            this.tempColor[this.colorLen + 11] = renderObject.alpha;
            this.tempColor[this.colorLen + 12] = renderObject.color[12] * renderObject.brightness;
            this.tempColor[this.colorLen + 13] = renderObject.color[13] * renderObject.brightness;
            this.tempColor[this.colorLen + 14] = renderObject.color[14] * renderObject.brightness;
            this.tempColor[this.colorLen + 15] = renderObject.alpha;
            this.isColorChanged = true;
            this.colorLen += 16;
        }

        // Только для примитивных спрайтов
        if (this.shader === Render2D.shaderList['image2d']) {
            if (Render2D.isHardOptimization) {
                // Обновляем координаты и размер
                if ((renderObject.lastChunkId !== this.id || renderObject.lastChunkPosition !== this.size || renderObject.isChanged)) {
                    if (renderObject.isPositionChanged) {
                        this.tempMatrixOne[this.mx1Len] = renderObject.x;
                        this.tempMatrixOne[this.mx1Len + 1] = renderObject.y;
                        this.tempMatrixOne[this.mx1Len + 2] = renderObject.x;
                        this.tempMatrixOne[this.mx1Len + 3] = renderObject.y;
                        this.tempMatrixOne[this.mx1Len + 4] = renderObject.x;
                        this.tempMatrixOne[this.mx1Len + 5] = renderObject.y;
                        this.tempMatrixOne[this.mx1Len + 6] = renderObject.x;
                        this.tempMatrixOne[this.mx1Len + 7] = renderObject.y;
                        this.isMx1Changed = true;
                    }

                    if (renderObject.isSizeChanged) {
                        this.tempMatrixTwo[this.mx1Len] = renderObject.width;
                        this.tempMatrixTwo[this.mx1Len + 1] = renderObject.height;
                        this.tempMatrixTwo[this.mx1Len + 2] = renderObject.width;
                        this.tempMatrixTwo[this.mx1Len + 3] = renderObject.height;
                        this.tempMatrixTwo[this.mx1Len + 4] = renderObject.width;
                        this.tempMatrixTwo[this.mx1Len + 5] = renderObject.height;
                        this.tempMatrixTwo[this.mx1Len + 6] = renderObject.width;
                        this.tempMatrixTwo[this.mx1Len + 7] = renderObject.height;
                        this.isMx2Changed = true;
                    }
                }

                this.mx1Len += 8;
                this.mx2Len += 8;
            } else {
                this.tempMatrixOne[this.mx1Len] = renderObject.x;
                this.tempMatrixOne[this.mx1Len + 1] = renderObject.y;
                this.tempMatrixOne[this.mx1Len + 2] = renderObject.x;
                this.tempMatrixOne[this.mx1Len + 3] = renderObject.y;
                this.tempMatrixOne[this.mx1Len + 4] = renderObject.x;
                this.tempMatrixOne[this.mx1Len + 5] = renderObject.y;
                this.tempMatrixOne[this.mx1Len + 6] = renderObject.x;
                this.tempMatrixOne[this.mx1Len + 7] = renderObject.y;

                this.tempMatrixTwo[this.mx1Len] = renderObject.width;
                this.tempMatrixTwo[this.mx1Len + 1] = renderObject.height;
                this.tempMatrixTwo[this.mx1Len + 2] = renderObject.width;
                this.tempMatrixTwo[this.mx1Len + 3] = renderObject.height;
                this.tempMatrixTwo[this.mx1Len + 4] = renderObject.width;
                this.tempMatrixTwo[this.mx1Len + 5] = renderObject.height;
                this.tempMatrixTwo[this.mx1Len + 6] = renderObject.width;
                this.tempMatrixTwo[this.mx1Len + 7] = renderObject.height;

                this.mx1Len += 8;
                this.mx2Len += 8;
            }
        }

        // Обновляем данные чанка в объекте
        renderObject.lastChunkId = this.id;
        renderObject.lastChunkPosition = this.size;
        this.size += 1;
        this.triangles += 2;
    };

    // Подготовить чанк, отправляет записанные данные в GPU
    prepare() {
        if (this.isRemoved) {return;}

        // Если вертексы изменились, то перезаписать массив
        if (this.isVertexChanged) {
            Render2D.gl.bindBuffer(Render2D.gl.ARRAY_BUFFER, this.vertexBuffer);
            Render2D.gl.bufferData(Render2D.gl.ARRAY_BUFFER, this.tempVertex, Render2D.gl.DYNAMIC_DRAW);
            //Render2D.stat.vertexBufferUploadCount += 1;
        }

        if (this.isColorChanged) {
            // Цвета пока отправляем всегда
            Render2D.gl.bindBuffer(Render2D.gl.ARRAY_BUFFER, this.colorBuffer);
            Render2D.gl.bufferData(Render2D.gl.ARRAY_BUFFER, this.tempColor, Render2D.gl.DYNAMIC_DRAW);
            //Render2D.stat.colorBufferUploadCount += 1;
        }

        // Если UV изменилась, отправляем в гпу
        if (this.isUvChanged) {
            Render2D.gl.bindBuffer(Render2D.gl.ARRAY_BUFFER, this.uvBuffer);
            Render2D.gl.bufferData(Render2D.gl.ARRAY_BUFFER, this.tempUv, Render2D.gl.DYNAMIC_DRAW);
            //Render2D.stat.uvBufferUploadCount += 1;
        }

        // Только для примитивного шейдера
        if (this.shader === Render2D.shaderList['image2d']) {
            // Отправляем матрицу координат
            if (this.isMx1Changed) {
                Render2D.gl.bindBuffer(Render2D.gl.ARRAY_BUFFER, this.matrixOneBuffer);
                Render2D.gl.bufferData(Render2D.gl.ARRAY_BUFFER, this.tempMatrixOne, Render2D.gl.DYNAMIC_DRAW);
            }

            // Отправляем матрицу размера
            if (this.isMx2Changed) {
                Render2D.gl.bindBuffer(Render2D.gl.ARRAY_BUFFER, this.matrixTwoBuffer);
                Render2D.gl.bufferData(Render2D.gl.ARRAY_BUFFER, this.tempMatrixTwo, Render2D.gl.DYNAMIC_DRAW);
            }
        }

        this.isPrepared = true;
    };

    // Сбрасываем состояние чанка
    reset() {
        this.size = 0;
        this.triangles = 0;
        this.vertexLen = 0;
        this.indexLen = 0;
        this.mx1Len = 0;
        this.mx2Len = 0;
        this.uvLen = 0;
        this.colorLen = 0;
        this.count = 0;
        this.isChanged = false;
        this.isVertexChanged = false;
        this.isUvChanged = false;
        this.isMx1Changed = false;
        this.isMx2Changed = false;
        this.isColorChanged = false;
        this.isPrepared = false;
    };

    // Уничтожаем чанк
    destroy() {
        Render2D.gl.deleteBuffer(this.indexBuffer);
        Render2D.gl.deleteBuffer(this.vertexBuffer);
        Render2D.gl.deleteBuffer(this.uvBuffer);
        Render2D.gl.deleteBuffer(this.colorBuffer);
        Render2D.gl.deleteBuffer(this.matrixOneBuffer);
        Render2D.gl.deleteBuffer(this.matrixTwoBuffer);

        this.size = 0;
        this.triangles = 0;
        this.tempIndex = null;
        this.tempVertex = null;
        this.tempUv = null;
        this.tempColor = null;
        this.tempMatrixOne = null;
        this.tempMatrixTwo = null;
        this.isRemoved = true;
    }
}