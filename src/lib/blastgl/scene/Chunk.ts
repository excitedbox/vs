import RenderObject from "../render/RenderObject";
import Shader from "../shader/Shader";
import BlastGL from "../BlastGL";
import Material from "../shader/Material";

export default class Chunk {
    public readonly id: number;
    public maxSize: number = 4096;

    private _material: Material;
    public texture: WebGLTexture;

    private _parameterDataLength: {} = {};
    private _valueList: Float32Array[] = [];
    private _bufferList: WebGLBuffer[] = [];
    private _objectList: RenderObject[] = [];

    constructor(id: number) {
        this.id = id;
    }

    public get material(): Material {
        return this._material;
    }

    public set material(material: Material) {
        this._material = material;

        // Get properties for material
        const params = material.shaderPropertyList;

        // Init buffers for all properties
        for (let i = 0; i < params.length; i++) {
            if (params[i].type === "texture") {
                continue;
            }

            const buffer = BlastGL.renderer.gl.createBuffer();
            this._bufferList.push(buffer);
        }
    }

    public addObject(renderObject: RenderObject): void {
        if (!renderObject.isVisible) {
            return;
        }

        // Get properties for material
        const params = renderObject.material.shaderPropertyList;

        // Calculate all parameters length
        for (let i = 0; i < params.length; i++) {
            if (params[i].type === "texture") {
                continue;
            }

            this._parameterDataLength[params[i].name] += renderObject.material.pullProperty(params[i].name).length;
        }

        // Add object to pool
        this._objectList.push(renderObject);
    }

    public build(): void {
        // Get properties for material
        const params = this._material.shaderPropertyList;

        // Allocate all arrays
        for (let i = 0; i < params.length; i++) {
            if (params[i].type === "texture") {
                continue;
            }

            // Allocate array
            this._valueList[i] = new Float32Array(this._parameterDataLength[params[i].name]);

            for (let j = 0; j < this._objectList.length; j++) {
                const object = this._objectList[j];
                const parameter = object.material.pullProperty(params[i].name);
                let positionId: number = 0;

                // Put element's vertex in chunk vertex array
                for (let k = 0; k < parameter.length; k++) {
                    this._valueList[i][positionId++] = parameter[j];
                }
            }

            if (params[i].type === "index") {
                // Upload buffer to GPU
                BlastGL.renderer.gl.bindBuffer(BlastGL.renderer.gl.ELEMENT_ARRAY_BUFFER, this._bufferList[i]);
                BlastGL.renderer.gl.bufferData(BlastGL.renderer.gl.ELEMENT_ARRAY_BUFFER, this._valueList[i], BlastGL.renderer.gl.DYNAMIC_DRAW);
            } else {
                // Upload buffer to GPU
                BlastGL.renderer.gl.bindBuffer(BlastGL.renderer.gl.ARRAY_BUFFER, this._bufferList[i]);
                BlastGL.renderer.gl.bufferData(BlastGL.renderer.gl.ARRAY_BUFFER, this._valueList[i], BlastGL.renderer.gl.DYNAMIC_DRAW);
            }
        }
    }

    public draw(): void {
        const gl = BlastGL.renderer.gl;

        // Set shader
        gl.useProgram(this.material.shader.program);
        this.material.shader.enableVertexAttribArray();

        // Get properties for material
        const params = this._material.shaderPropertyList;

        for (let i = 0; i < params.length; i++) {
            if (params[i].type === "index") {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._bufferList[i]);
            } else
            if (params[i].type === "texture") {
                // Bind texture
                gl.activeTexture(gl.TEXTURE0);
                gl.uniform1i(gl.getUniformLocation(this.material.shader.program, params[i].name), 0);
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
            } else {
                gl.bindBuffer(gl.ARRAY_BUFFER, this._bufferList[i]);
                gl.vertexAttribPointer(
                    this.material.shader.getAttributeLocation(params[i].name), params[i].size,
                    gl.FLOAT, false, 0, 0);
            }
        }

        // Индексный буфер
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tempChunk.indexBuffer);

        // Pass camera matrix to shader
        // We pass global camera or chunk specific camera
        // gl.uniformMatrix4fv(tempChunk.material.shader.getUniformLocation('uCameraMatrix'), false, tempChunk.camera ?tempChunk.camera.matrix.matrix :BlastGL.scene.camera.matrix.matrix);

        // Отрисовка чанка
        // gl.drawElements(gl.TRIANGLES, tempChunk.size * 6, this._gl.UNSIGNED_SHORT, 0);
    }
}