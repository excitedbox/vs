import Sprite from "./Sprite";
import BitmapFont from "../texture/BitmapFont";
import BlastGL from "../BlastGL";
import TextureAtlasArea from "../texture/TextureAtlasArea";
import Vector2D from "../../math/geom/Vector2D";

export type TypeTextParameters = {
    blastGl: BlastGL;
    x: number;
    y: number;
    text: string;
    font: BitmapFont;
};

export default class BitmapText extends Sprite {
    public readonly font: BitmapFont;
    private _area: TextureAtlasArea;
    private _text: string;

    constructor(params: TypeTextParameters) {
        super({
            blastGl: params.blastGl,
            x: params.x,
            y: params.y,
            // texture: params.font.texture
        });

        this.font = params.font;
        this.text = params.text;
    }

    set text(text: string) {
        // Set text
        this._text = text;

        // Calculate text area size
        const textSize = this.font.calculateTextSize(text);

        // Prepare text area
        if (this._area) {
            this.blastGl.renderer.textureManager.freeTextureArea(this._area);
        }
        this._area = this.blastGl.renderer.textureManager.allocateTextureArea(textSize.width, textSize.height);

        // Set text size
        this.width = textSize.width;
        this.height = textSize.height;

        // Начальные координаты текста
        let x = -(this.font.glyphWidth);
        let y = 0;

        // Проходим по каждой букве текста
        for (let i = 0; i < this._text.length; i++) {
            x += this.font.glyphWidth;

            // Если перенос строки
            if (this._text.charAt(i) === '\n') {
                x = -(this.font.glyphWidth);
                y += this.font.glyphHeight;
                continue;
            }

            // Получаем позицию символа на канвасе
            const charArea = this.font.getCharPosition(this._text.charAt(i));

            // Copy from table to text area
            const imgData = this.blastGl.renderer.textureManager.copyTextureData(charArea);
            this.blastGl.renderer.textureManager.pasteTextureData(imgData, new Vector2D(this._area.area.x + x, this._area.area.y + y));
        }

        this.texture.uv = this._area.uv;
    }
}