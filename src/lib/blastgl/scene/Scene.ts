import Layer from "./Layer";
import ShapeObject from "../render/ShapeObject";
import Camera from "./Camera";
import BlastGL from "../BlastGL";
import RenderObject from "../render/RenderObject";
import Chunk from "./Chunk";
import Texture from "../texture/Texture";
import Material from "../shader/Material";
import SpriteMaterial from "../material/SpriteMaterial";

export default class Scene {
    public blastGl: BlastGL;

    public readonly layers: Layer[] = [];
    public isPaused: boolean = false;
    public camera: Camera;
    public isNeedGarbageCollector: boolean = false;

    private _chunkList: Chunk[] = [];
    private _chunkCounter: number = 0;

    /*public fb: WebGLFramebuffer;
    public tt: Texture;
    public mat: Material;*/

    async init(): Promise<void> {
        //this.tt = await Texture.from(this.blastGl, { width: 720, height: 480 });

        // Create and bind the framebuffer
        /*this.fb = this.blastGl.renderer.gl.createFramebuffer();
        this.blastGl.renderer.gl.bindFramebuffer(this.blastGl.renderer.gl.FRAMEBUFFER, this.fb);
        this.blastGl.renderer.gl.framebufferTexture2D(
            this.blastGl.renderer.gl.FRAMEBUFFER, this.blastGl.renderer.gl.COLOR_ATTACHMENT0,
            this.blastGl.renderer.gl.TEXTURE_2D, this.tt.texture, 0);*/

        /*this.fb2 = this.blastGl.renderer.gl.createFramebuffer();
        this.blastGl.renderer.gl.bindFramebuffer(this.blastGl.renderer.gl.FRAMEBUFFER, this.fb2);
        this.blastGl.renderer.gl.framebufferTexture2D(
            this.blastGl.renderer.gl.FRAMEBUFFER, this.blastGl.renderer.gl.COLOR_ATTACHMENT0,
            this.blastGl.renderer.gl.TEXTURE_2D, this.tt2.texture, 0);*/

        // may
        // this.mat = new SpriteMaterial(this.blastGl);
    }

    addObject(object: ShapeObject, layerId: number = 0): void {
        // Find a layer with such id
        let layer = null;
        for (let i = 0; i < this.layers.length; i++) {
            if (this.layers[i].id === layerId) {
                layer = this.layers[i];
                break;
            }
        }

        // Create if not found
        if (!layer) {
            layer = new Layer(layerId);
            this.layers.push(layer);
        }

        // Add object to layer
        if (layer.elements.indexOf(object) === -1) {
            layer.elements.push(object);
        }

        // Sort layers by id
        this.layers.sort(function (a: Layer, b: Layer) {
            return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);
        });

        // Add object in chunk system
        if (object instanceof RenderObject) {
            this.addObjectToChunk(object);
        }
    }

    private addObjectToChunk(object: RenderObject): void {
        let isFound = false;
        let chunk: Chunk;

        for (let i = 0; i < this._chunkList.length; i++) {
            chunk = this._chunkList[i];
            isFound = true;

            // Check shader
            if (chunk.material.shader !== object.material.shader) {
                isFound = false;
                continue;
            }
        }

        if (!isFound) {
            chunk = this.allocateChunk();
            chunk.camera = this.camera;
            chunk.material = object.material;
            chunk.addObject(object);
        } else {
            chunk.addObject(object);
        }

        // Info about chunk's amount
        this.blastGl.info.chunkAmount = this._chunkList.length;
    }

    private removeObjectFromChunk(object: RenderObject): void {
        for (let i = 0; i < this._chunkList.length; i++) {
            this._chunkList[i].removeObject(object);
        }
    }

    private allocateChunk(): Chunk {
        this._chunkCounter += 1;
        if (!this._chunkList[this._chunkCounter - 1]) {
            this._chunkList[this._chunkCounter - 1] = new Chunk(this.blastGl, this._chunkCounter - 1);
        }

        return this._chunkList[this._chunkCounter - 1];
    }

    getLayer(id: number): Layer {
        for (let i = 0; i < this.layers.length; i++) {
            if (this.layers[i].id === id) {
                return this.layers[i];
            }
        }
        return null;
    }

    update(delta: number): void {
        // Update camera
        this.camera?.update();
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].camera?.update();
        }

        // Delete removed elements
        if (this.isNeedGarbageCollector) {
            for (let i = 0; i < this.layers.length; i++) {
                for (let j = 0; j < this.layers[i].elements.length; j++) {
                    if (this.layers[i].elements[j].isRemoved) {
                        this.removeObjectFromChunk(this.layers[i].elements[j]);
                        this.layers[i].elements.splice(j, 1);
                        j -= 1;
                    }
                }
            }
        }

        // Update elements
        for (let i = 0; i < this.layers.length; i++) {
            for (let j = 0; j < this.layers[i].elements.length; j++) {
                const tempElement = this.layers[i].elements[j];
                // tempElement.zIndex = -(i * 2) - (j / this.layers[i].elements.length);

                if (tempElement.update) {
                    tempElement.update(delta);
                }
            }
        }

        // Build chunks
        for (let i = 0; i < this._chunkList.length; i++) {
            const chunk = this._chunkList[i];
            chunk.build();
        }
    }

    draw(material: Material = null): void {
        for (let i = 0; i < this._chunkList.length; i++) {
            const chunk = this._chunkList[i];
            chunk.draw(material);
        }
    }

    destroy(): void {

    }
}