import BlastGL from "../BlastGL";

export default class Texture {
    // Data info
    public readonly url: string;
    public readonly image: HTMLImageElement;

    // Texture size
    public readonly width: number = 0;
    public readonly height: number = 0;

    // Atlas info
    public atlasId: number;
    public atlasX: number = 0;
    public atlasY: number = 0;
    public atlasWidth: number = 0;
    public atlasHeight: number = 0;

    // WebGL info
    public texture: WebGLTexture = null;
    public uv: Float32Array = new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]);
    public baseUV: Float32Array = new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]);
    public triangleUV: Float32Array = new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]);

    constructor({blastGl, url, image, useAtlas, width, height}:
                    { blastGl: BlastGL; useAtlas?: boolean; url?: string; image?: HTMLImageElement; width?: number; height?: number }) {
        if (width && height) {
            this.width = width;
            this.height = height;

            const gl = blastGl.renderer.gl;

            // Create texture
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.bindTexture(gl.TEXTURE_2D, null);
        } else {
            this.url = url || null;
            this.image = image;
            this.width = image.width;
            this.height = image.height;

            if (useAtlas) {
                blastGl.renderer.textureManager.addTexture(this);
            }
        }
    }

    // Create texture from url
    static async from(blastGl: BlastGL, url: string, useAtlas?: boolean): Promise<Texture>;
    static async from(blastGl: BlastGL, params: { width: number; height: number }): Promise<Texture>;
    static async from(blastGl: BlastGL, data: unknown, useAtlas: boolean = true): Promise<Texture> {
        if (typeof data === "string") {
            const image = new Image();
            image.src = data;

            return new Promise((resolve: Function) => {
                image.onload = (): void => {
                    const texture = new Texture({blastGl, url: data, image, useAtlas});
                    resolve(texture);
                };
            });
        }

        if (typeof data === "object") {
            return new Promise<Texture>(((resolve: Function) => {
                const texture = new Texture({blastGl, width: data['width'], height: data['height'], useAtlas});
                resolve(texture);
            }));
        }
    }

    update(): void {
    }

    destroy(): void {
    }
}
