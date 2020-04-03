import Shader from "./Shader";
import Texture from "../texture/Texture";
import BlastGL from "../BlastGL";
import RenderObject, {RenderObjectType} from "./RenderObject";
import Camera from "./Camera";

export default class Chunk {
    public readonly id: number;

    public shader: Shader;
    public texture: WebGLTexture;
    public triangles: number = 0;
    public size: number;
    public maxSize: number = 4096; // макс размер чанка, кол-во элементов по умолчанию
    public camera: Camera;

    // Текущая длинна массивов
    public indexLen: number = 0;
    public vertexLen: number = 0;
    public uvLen: number = 0;
    public colorLen: number = 0;

    // Массивы для буферов
    public tempIndex = new Uint16Array(this.maxSize * 6);
    public tempVertex = new Float32Array(this.maxSize * 12);
    public tempUv = new Float32Array(this.maxSize * 8);
    public tempColor = new Float32Array(this.maxSize * 16);

    public readonly indexBuffer: WebGLBuffer;
    public readonly vertexBuffer: WebGLBuffer;
    public readonly uvBuffer: WebGLBuffer;
    public readonly colorBuffer: WebGLBuffer;

    // Состояние чанка
    public isVertexChanged = false;
    public isUvChanged = false;
    public isColorChanged = false;

    public isRemoved = false;
    public isOrderChanged = false;
    public isPrepared = false;
    public isChanged = false;

    constructor(id: number) {
        this.id = id;

        this.indexBuffer = BlastGL.gl.createBuffer();
        this.vertexBuffer = BlastGL.gl.createBuffer();
        this.uvBuffer = BlastGL.gl.createBuffer();
        this.colorBuffer = BlastGL.gl.createBuffer();

        // Индексы должны быть всегда одинаковые, так как это 2d чанк
        let count = 0;
        for (let i = 0; i < this.maxSize; i++) {
            const cnt = count * 4;
            this.tempIndex[this.indexLen] = cnt;
            this.tempIndex[this.indexLen + 1] = 1 + cnt;
            this.tempIndex[this.indexLen + 2] = 2 + cnt;
            this.tempIndex[this.indexLen + 3] = cnt;
            this.tempIndex[this.indexLen + 4] = 2 + cnt;
            this.tempIndex[this.indexLen + 5] = 3 + cnt;
            this.indexLen += 6;
            count += 1;
        }

        // Сразу заливаем индексы в буфер
        BlastGL.gl.bindBuffer(BlastGL.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        BlastGL.gl.bufferData(BlastGL.gl.ELEMENT_ARRAY_BUFFER, this.tempIndex, BlastGL.gl.DYNAMIC_DRAW);
    }

    addObject(object: RenderObject): void {
        if (!object.isVisible) {
            return;
        }

        // Если объект поменял чанк или позицию в чанке, а так же его вертексы изменились, значит надо обновить
        this.tempVertex[this.vertexLen] = object.vertex[0];
        this.tempVertex[this.vertexLen + 1] = object.vertex[1];
        this.tempVertex[this.vertexLen + 2] = object.vertex[2];
        this.tempVertex[this.vertexLen + 3] = object.vertex[3];
        this.tempVertex[this.vertexLen + 4] = object.vertex[4];
        this.tempVertex[this.vertexLen + 5] = object.vertex[5];
        this.tempVertex[this.vertexLen + 6] = object.vertex[6];
        this.tempVertex[this.vertexLen + 7] = object.vertex[7];

        this.tempVertex[this.vertexLen + 8] = object.vertex[8];
        this.tempVertex[this.vertexLen + 9] = object.vertex[9];
        this.tempVertex[this.vertexLen + 10] = object.vertex[10];
        this.tempVertex[this.vertexLen + 11] = object.vertex[11];
        this.isVertexChanged = true;

        // Тоже самое для UV координат, правда пока UV фиксированы
        if (object.texture) {
            this.tempUv[this.uvLen] = object.texture.uv[0];
            this.tempUv[this.uvLen + 1] = object.texture.uv[1];
            this.tempUv[this.uvLen + 2] = object.texture.uv[2];
            this.tempUv[this.uvLen + 3] = object.texture.uv[3];
            this.tempUv[this.uvLen + 4] = object.texture.uv[4];
            this.tempUv[this.uvLen + 5] = object.texture.uv[5];
            this.tempUv[this.uvLen + 6] = object.texture.uv[6];
            this.tempUv[this.uvLen + 7] = object.texture.uv[7];
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
        this.vertexLen += object.vertex.length;
        this.uvLen += 8; // UV same length as vertex

        // Цвета только для спрайтов
        if (this.shader === BlastGL.shaderList['sprite2d']) {
            this.tempColor[this.colorLen] = object.color[0] * object.brightness;
            this.tempColor[this.colorLen + 1] = object.color[1] * object.brightness;
            this.tempColor[this.colorLen + 2] = object.color[2] * object.brightness;
            this.tempColor[this.colorLen + 3] = object.alpha;
            this.tempColor[this.colorLen + 4] = object.color[4] * object.brightness;
            this.tempColor[this.colorLen + 5] = object.color[5] * object.brightness;
            this.tempColor[this.colorLen + 6] = object.color[6] * object.brightness;
            this.tempColor[this.colorLen + 7] = object.alpha;
            this.tempColor[this.colorLen + 8] = object.color[8] * object.brightness;
            this.tempColor[this.colorLen + 9] = object.color[9] * object.brightness;
            this.tempColor[this.colorLen + 10] = object.color[10] * object.brightness;
            this.tempColor[this.colorLen + 11] = object.alpha;
            this.tempColor[this.colorLen + 12] = object.color[12] * object.brightness;
            this.tempColor[this.colorLen + 13] = object.color[13] * object.brightness;
            this.tempColor[this.colorLen + 14] = object.color[14] * object.brightness;
            this.tempColor[this.colorLen + 15] = object.alpha;
            this.isColorChanged = true;
            this.colorLen += 16;
        }

        // Обновляем данные чанка в объекте
        object.lastChunkId = this.id;
        object.lastChunkPosition = this.size;
        this.size += 1;
        this.triangles += 2;
    }

    prepare() {
        if (this.isRemoved) {
            return;
        }

        // Если вертексы изменились, то перезаписать массив
        if (this.isVertexChanged) {
            BlastGL.gl.bindBuffer(BlastGL.gl.ARRAY_BUFFER, this.vertexBuffer);
            BlastGL.gl.bufferData(BlastGL.gl.ARRAY_BUFFER, this.tempVertex, BlastGL.gl.DYNAMIC_DRAW);
        }

        if (this.isColorChanged) {
            // Цвета пока отправляем всегда
            BlastGL.gl.bindBuffer(BlastGL.gl.ARRAY_BUFFER, this.colorBuffer);
            BlastGL.gl.bufferData(BlastGL.gl.ARRAY_BUFFER, this.tempColor, BlastGL.gl.DYNAMIC_DRAW);
        }

        // Если UV изменилась, отправляем в гпу
        if (this.isUvChanged) {
            BlastGL.gl.bindBuffer(BlastGL.gl.ARRAY_BUFFER, this.uvBuffer);
            BlastGL.gl.bufferData(BlastGL.gl.ARRAY_BUFFER, this.tempUv, BlastGL.gl.DYNAMIC_DRAW);
        }

        this.isPrepared = true;
    }

    reset() {
        this.size = 0;
        this.triangles = 0;
        this.vertexLen = 0;
        this.indexLen = 0;
        this.uvLen = 0;
        this.colorLen = 0;
        this.isChanged = false;
        this.isVertexChanged = false;
        this.isUvChanged = false;
        this.isColorChanged = false;
        this.isPrepared = false;
    };

    update(): void {

    }

    destroy() {

    }
}