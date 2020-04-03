import TextureAtlas from "./TextureAtlas";
import Texture from "./Texture";

export default class TextureManager {
    private _atlasList: TextureAtlas[] = [];

    constructor(sceneName: string) {
        this._atlasList.push(new TextureAtlas(sceneName, 0, 4096, 4096));
    }

    // Register texture
    addTexture(texture: Texture): void {
        this._atlasList[0].addTexture(texture);
    };

    // Update atlas
    update(): void {
        for (let i = 0; i < this._atlasList.length; i++) {
            this._atlasList[i].update();
        }
    };
}