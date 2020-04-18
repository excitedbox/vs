import TextureAtlas from "./TextureAtlas";
import Texture from "./Texture";
import TextureAtlasArea from "./TextureAtlasArea";
import Rectangle from "../../math/geom/Rectangle";
import Vector2D from "../../math/geom/Vector2D";

export default class TextureManager {
    private _atlasList: TextureAtlas[] = [];

    constructor(sceneName: string) {
        this._atlasList.push(new TextureAtlas(sceneName, 0, 512, 512));
    }

    // Register texture
    addTexture(texture: Texture): void {
        this._atlasList[0].addTexture(texture);
    }

    allocateArea(width: number, height: number): TextureAtlasArea {
        return this._atlasList[0].allocateArea(width, height);
    }

    freeArea(area: TextureAtlasArea): void {
        this._atlasList[0].freeArea(area);
    }

    copyTextureData(area: Rectangle): ImageData {
        return this._atlasList[0].copyTextureData(area);
    }

    pasteTextureData(imageData: ImageData, to: Vector2D): void {
        this._atlasList[0].pasteTextureData(imageData, to);
    }

    // Update atlas
    update(): void {
        for (let i = 0; i < this._atlasList.length; i++) {
            this._atlasList[i].update();
        }
    };
}