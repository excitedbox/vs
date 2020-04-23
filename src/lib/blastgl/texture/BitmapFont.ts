import Texture from "./Texture";
import Rectangle from "../../math/geom/Rectangle";
import BlastGL from "../BlastGL";

export type TypeBitmapFontParameters = {
    blastGl: BlastGL;
    fontUrl: string;
    glyphWidth: number;
    glyphHeight: number;
    letterSpacing?: number;
    charWidth?: { [key: string]: number };
};

export default class BitmapFont {
    private readonly _blastGl: BlastGL;

    private readonly _fontUrl: string;
    public readonly glyphWidth: number;
    public readonly glyphHeight: number;
    public readonly letterSpacing: number;
    private _fontTexture: Texture;
    private _charWidth: { [key: string]: number };
    private _isCaseSensitive: boolean;

    constructor(params: TypeBitmapFontParameters) {
        this._blastGl = params.blastGl;
        this._fontUrl = params.fontUrl;
        this.glyphWidth = params.glyphWidth;
        this.glyphHeight = params.glyphHeight;
        this.letterSpacing = ~~params.letterSpacing;
    }

    async load(): Promise<void> {
        this._fontTexture = await Texture.from(this._blastGl, this._fontUrl);
    }

    getCharPosition(char: string, isLocalPosition: boolean = false): Rectangle {
        if (!this._isCaseSensitive) {
            char = char.toUpperCase();
        }

        const offsetX = ((char.charCodeAt(0) - 32) % 32) * this.glyphWidth;
        const offsetY = Math.floor((char.charCodeAt(0) - 32) / 32) * this.glyphHeight;

        return new Rectangle(
            isLocalPosition ? offsetX : this._fontTexture.atlasX + offsetX,
            isLocalPosition ? offsetY : this._fontTexture.atlasY + offsetY,
            (isLocalPosition ? offsetX : this._fontTexture.atlasX + offsetX) + this.glyphWidth,
            (isLocalPosition ? offsetY : this._fontTexture.atlasY + offsetY) + this.glyphHeight
        );
    }

    getCharWidth(char: string): number {
        return ~~this._charWidth[char] || this.glyphWidth;
    }

    calculateTextSize(text: string): {width: number; height: number} {
        const lines = 1 + text.count('\n');

        return {
            width: text.length * this.glyphWidth,
            height: lines * this.glyphHeight
        };
    };

    get name(): string {
        const s = this._fontUrl.split('/');
        return  s[s.length - 1].replace('.png', '');
    }

    get texture(): Texture {
        return this._fontTexture;
    }
}