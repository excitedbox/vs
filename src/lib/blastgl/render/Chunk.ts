import Shader from "./Shader";
import Texture from "../texture/Texture";
import BlastGL from "../BlastGL";
import RenderObject, {RenderObjectType} from "./RenderObject";

export default class Chunk {
    public readonly id: number;

    public shader: Shader;
    public texture: Texture;
    public size: number;
    public maxSize: number = 4096; // макс размер чанка, кол-во элементов по умолчанию

    // Текущая длинна массивов
    public indexLen = 0;
    public vertexLen = 0;
    public uvLen = 0;
    public colorLen = 0;

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
    }

    addObject(object: RenderObject) {
        if (!object.isVisible) {
            return;
        }

        if (object.type === RenderObjectType.Container) {
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
    }

    update(): void {

    }
}