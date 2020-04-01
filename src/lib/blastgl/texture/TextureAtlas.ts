import BlastGL from "../BlastGL";
import Texture from "./Texture";
import Rectangle from "../../math/geom/Rectangle";
import TextureAtlasArea from "./TextureAtlasArea";

export default class TextureAtlas {
    public readonly canvas: HTMLCanvasElement;
    public readonly context: CanvasRenderingContext2D = null;
    public readonly texture: WebGLTexture = null;

    private readonly _allocatedAreaList: TextureAtlasArea[] = [];

    // private _isNeedToUpdate: boolean = false;

    public readonly width: number;
    public readonly height: number;

    constructor(sceneName: string, canvasId: number, width: number, height: number) {
        // Create canvas
        this.canvas = document.querySelector('#atlas_' + sceneName + '_' + canvasId);
        if (!this.canvas) {
            BlastGL.atlasContainer.innerHTML += '<canvas id="atlas_' + sceneName + '_' + canvasId + '" style="display: block;"></canvas>';
            this.canvas = document.querySelector('#atlas_' + sceneName + '_' + canvasId);
            this.canvas.setAttribute("width", width + '');
            this.canvas.setAttribute("height", height + '');
        }

        // Set context
        this.context = this.canvas.getContext("2d");
        this.context.fillStyle = "#666666";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Set size
        this.width = width;
        this.height = height;

        // Create texture
        this.texture = BlastGL.gl.createTexture();
        BlastGL.gl.bindTexture(BlastGL.gl.TEXTURE_2D, this.texture);
        BlastGL.gl.pixelStorei(BlastGL.gl.UNPACK_FLIP_Y_WEBGL, true);
        BlastGL.gl.texImage2D(BlastGL.gl.TEXTURE_2D, 0, BlastGL.gl.RGBA, BlastGL.gl.RGBA, BlastGL.gl.UNSIGNED_BYTE, this.canvas);
        BlastGL.gl.texParameteri(BlastGL.gl.TEXTURE_2D, BlastGL.gl.TEXTURE_MAG_FILTER, BlastGL.gl.NEAREST);
        BlastGL.gl.texParameteri(BlastGL.gl.TEXTURE_2D, BlastGL.gl.TEXTURE_MIN_FILTER, BlastGL.gl.NEAREST);
        BlastGL.gl.generateMipmap(BlastGL.gl.TEXTURE_2D);
        BlastGL.gl.bindTexture(BlastGL.gl.TEXTURE_2D, null);

        // Update atlas
        this.update();
    }

    findTextureByURL(url: string): boolean {
        for (let i = 0; i < this._allocatedAreaList.length; i++) {
            if (this._allocatedAreaList[i].texture.url === url) {
                return true;
            }
        }

        return false;
    };

    allocateArea(width: number, height: number, isAutoAdd: boolean = true): TextureAtlasArea {
        if (this.width < width || this.height < height) {
            throw new Error(`Can't fit texture into atlas`);
        }

        let isFound = false;
        const tempRectangle = new Rectangle(0, 0, width, height);

        // Ищем в атласе свободное место
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                // Текущая область, смещаем по 1му пискелю
                tempRectangle.left = i;
                tempRectangle.top = j;
                tempRectangle.right = i + width;
                tempRectangle.bottom = j + height;

                // Если дошли до самого низа атласа, то начинаем сначала
                if (tempRectangle.bottom > this.height) {
                    isFound = true;
                    break;
                }

                // Проходим по всем изображениям и проверяем коллизию с ними
                isFound = false;
                for (let k = 0; k < this._allocatedAreaList.length; k++) {
                    // Если коллизия с изображением случилась
                    if (tempRectangle.intersectRectangle(this._allocatedAreaList[k].area, true)) {
                        // Указываем что коллизия найдена, и смещаем текущую область вниз на размер изображения
                        isFound = true;
                        j = this._allocatedAreaList[k].area.bottom + 1;
                        break;
                    }
                }

                if (!isFound) {
                    break;
                }
            }
            if (!isFound) {
                break;
            }
        }

        if (isFound) {
            throw new Error(`Atlas is full`);
        }

        const area = new TextureAtlasArea({
            atlas: this,
            atlasTexture: this.texture,
            context: this.context,
            uv: new Float32Array([
                tempRectangle.left / this.canvas.width, 1 - (tempRectangle.top + height) / this.canvas.height,
                (tempRectangle.left + width) / this.canvas.width, 1 - (tempRectangle.top + height) / this.canvas.height,
                (tempRectangle.left + width) / this.canvas.width, 1 - tempRectangle.top / this.canvas.height,
                tempRectangle.left / this.canvas.width, 1 - tempRectangle.top / this.canvas.height
            ]),
            area: new Rectangle(tempRectangle.left, tempRectangle.top, tempRectangle.left + width, tempRectangle.top + height),
            texture: null
        });

        if (isAutoAdd) {
            this._allocatedAreaList.push(area);
        }

        return area;
    }

    addTexture(texture: Texture): void {
        // Ищем уже загруженную текстуру
        if (this.findTextureByURL(texture.url)) {
            return;
        }

        // ссылка на атлас
        texture.texture = this.texture;

        // Регистрируем свободную область для изображения
        const area = this.allocateArea(texture.width, texture.height);
        area.texture = texture;

        // Рисуем на канвас и обновляем атлас
        this.context.clearRect(area.area.x, area.area.y, texture.width, texture.height);
        this.context.drawImage(texture.image, area.area.x, area.area.y);
        this.update();

        // Возвращаем UV координаты текстуры
        texture.baseUV = new Float32Array([
            area.area.x / this.canvas.width, 1 - (area.area.y + area.area.bottom) / this.canvas.height,
            (area.area.x + area.area.right) / this.canvas.width, 1 - (area.area.y + area.area.bottom) / this.canvas.height,
            (area.area.x + area.area.right) / this.canvas.width, 1 - area.area.y / this.canvas.height,
            area.area.x / this.canvas.width, 1 - area.area.y / this.canvas.height
        ]);
        texture.triangleUV = new Float32Array([
            area.area.x / this.canvas.width, 1 - (area.area.y + area.area.bottom) / this.canvas.height,
            (area.area.x + area.area.right) / this.canvas.width, 1 - (area.area.y + area.area.bottom) / this.canvas.height,
            (area.area.x + area.area.right) / this.canvas.width, 1 - area.area.y / this.canvas.height,

            (area.area.x + area.area.right) / this.canvas.width, 1 - area.area.y / this.canvas.height,
            area.area.x / this.canvas.width, 1 - area.area.y / this.canvas.height,
            area.area.x / this.canvas.width, 1 - (area.area.y + area.area.bottom) / this.canvas.height
        ]);

        // Обновляем данные текстуры
        texture.uv = new Float32Array(texture.baseUV);
        texture.atlasX = area.area.x;
        texture.atlasY = area.area.y;
        texture.atlasWidth = this.canvas.width;
        texture.atlasHeight = this.canvas.height;
    };

    update(): void {
        // Redraw texture from canvas
        BlastGL.gl.bindTexture(BlastGL.gl.TEXTURE_2D, this.texture);
        BlastGL.gl.pixelStorei(BlastGL.gl.UNPACK_FLIP_Y_WEBGL, true);
        BlastGL.gl.texImage2D(BlastGL.gl.TEXTURE_2D, 0, BlastGL.gl.RGBA, BlastGL.gl.RGBA, BlastGL.gl.UNSIGNED_BYTE, this.canvas);
        BlastGL.gl.bindTexture(BlastGL.gl.TEXTURE_2D, null);
    }
}