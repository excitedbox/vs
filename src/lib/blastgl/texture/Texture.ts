import BlastGL from "../BlastGL";
import TextureManager from "./TextureManager";

export default class Texture {
    // Data info
    public readonly url: string;
    public readonly image: HTMLImageElement;

    // Texture size
    public readonly width: number = 0;
    public readonly height: number = 0;

    // Atlas info
    public atlasX: number = 0;
    public atlasY: number = 0;
    public atlasWidth: number = 0;
    public atlasHeight: number = 0;

    // WebGL info
    public texture: WebGLTexture = null;
    public uv: Float32Array = new Float32Array([1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    public baseUV: Float32Array = new Float32Array([1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    public triangleUV: Float32Array = new Float32Array([1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);

    constructor({blastGl, url, image, useAtlas}: { blastGl: BlastGL; useAtlas?: boolean; url?: string; image?: HTMLImageElement }) {
        this.url = url || null;
        this.image = image;

        this.width = image.width;
        this.height = image.height;

        if (useAtlas) {
            blastGl.renderer.textureManager.addTexture(this);
        }
    }

    // Create texture from url
    static async from(blastGl: BlastGL, url: string, useAtlas: boolean = true): Promise<Texture> {
        const image = new Image();
        image.src = url;

        return new Promise((resolve: Function) => {
            image.onload = (): void => {
                const texture = new Texture({blastGl, url, image, useAtlas});
                resolve(texture);
            };
        });
    }

    update(): void {
    }

    destroy(): void {
    }
}
