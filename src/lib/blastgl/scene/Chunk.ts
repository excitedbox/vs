import RenderObject from "../render/RenderObject";
import BlastGL from "../BlastGL";
import Material from "../shader/Material";
import Camera from "./Camera";

export default class Chunk {
    private readonly _blastGl: BlastGL;

    public readonly id: number;
    public layerId: number;
    public maxSize: number = 4096;
    public camera: Camera;

    private _material: Material;

    private _parameterLength: {} = {};
    private _parameterDataLength: {} = {};
    private _valueList: {[key: string]: Float32Array | Uint16Array} = {};
    private _bufferList: {[key: string]: WebGLBuffer} = {};
    private _objectList: RenderObject[] = [];
    private _indexAmount: number = 0;

    private _isObjectListChanged: boolean = false;

    constructor(blastGl: BlastGL, id: number) {
        this._blastGl = blastGl;
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
            if (!(params[i].type === "float" || params[i].type === "index"
                || params[i].type === "mesh" || params[i].type === "uv"
                || params[i].type === "screenUv")) {
                continue;
            }

            this._bufferList[params[i].name] = this._blastGl.renderer.gl.createBuffer();
        }
    }

    public addObject(renderObject: RenderObject): void {
        /*if (!renderObject.isVisible) {
            return;
        }*/

        // Get properties for material
        const params = renderObject.material.shaderPropertyList;


        // Calculate all parameters length
        for (let i = 0; i < params.length; i++) {
            if (!(params[i].type === "float" || params[i].type === "index"
                || params[i].type === "mesh" || params[i].type === "uv"
                || params[i].type === "screenUv")) {
                continue;
            }

            // Init counter
            if (!this._parameterDataLength[params[i].name]) {
                this._parameterDataLength[params[i].name] = 0;
            }

            // Init counter
            if (!this._parameterLength[params[i].name]) {
                this._parameterLength[params[i].name] = 0;
            }

            if (params[i].type === "mesh") {
                this._parameterDataLength[params[i].name] += renderObject.mesh.vertex.length;
                this._parameterLength[params[i].name] = renderObject.mesh.vertex.length;
            }
            if (params[i].type === "uv" && renderObject.mesh.uv[params[i].slot]) {
                this._parameterDataLength[params[i].name] += renderObject.mesh.uv[params[i].slot].length;
                this._parameterLength[params[i].name] = renderObject.mesh.uv[params[i].slot].length;
            }
            if (params[i].type === "screenUv" && renderObject.mesh.uv[16]) {
                this._parameterDataLength[params[i].name] += renderObject.mesh.uv[16].length;
                this._parameterLength[params[i].name] = renderObject.mesh.uv[16].length;
            }
            if (params[i].type === "index") {
                this._parameterDataLength[params[i].name] += renderObject.mesh.index.length;
                this._parameterLength[params[i].name] = renderObject.mesh.index.length;
            }
            if (params[i].type === "float") {
                this._parameterDataLength[params[i].name] += renderObject.material.getProperty(params[i].name).length;
                this._parameterLength[params[i].name] = renderObject.material.getProperty(params[i].name).length;
            }
        }

        // Add object to pool
        this._objectList.push(renderObject);

        this._isObjectListChanged = true;
    }

    public removeObject(renderObject: RenderObject): void {
        if (this._objectList.has(renderObject)) {
            this._objectList.remove(renderObject);
            this._isObjectListChanged = true;
        }
    }

    public build(): void {
        const gl = this._blastGl.renderer.gl;

        // Get properties for material
        const params = this._material.shaderPropertyList;

        // Reset index amount
        if (this._isObjectListChanged) {
            this._indexAmount = 0;
        }
        let indexOffset: number = 0;

        // Allocate all arrays
        for (let i = 0; i < params.length; i++) {
            if (!(params[i].type === "float" || params[i].type === "index"
                || params[i].type === "mesh" || params[i].type === "uv"
                || params[i].type === "screenUv")) {
                continue;
            }

            // Allocate array
            if (this._isObjectListChanged) {
                if (params[i].type === "index") {
                    this._valueList[params[i].name] = new Uint16Array(this._parameterDataLength[params[i].name]);
                } else {
                    this._valueList[params[i].name] = new Float32Array(this._parameterDataLength[params[i].name]);
                }
            } else {
                if (params[i].type === "index") {
                    continue;
                }
                if (params[i].type === "uv") {
                    continue;
                }
            }

            for (let j = 0; j < this._objectList.length; j++) {
                const object = this._objectList[j];
                object.camera = this.camera;
                let parameter = object.material.getProperty(params[i].name);
                let positionId: number = 0;

                if (params[i].type === "index") {
                    parameter = this._objectList[j].mesh.index;
                }

                if (params[i].type === "mesh") {
                    parameter = this._objectList[j].mesh.vertex;
                }

                if (params[i].type === "uv") {
                    parameter = this._objectList[j].mesh.uv[params[i].slot];
                }

                if (params[i].type === "screenUv") {
                    parameter = this._objectList[j].mesh.uv[16];
                }

                if (params[i].type === "index") {
                    // Put element's vertex in chunk vertex array
                    let gas = 0;
                    for (let k = 0; k < parameter.length; k++) {
                        this._valueList[params[i].name][
                            positionId++
                            + j * this._parameterLength[params[i].name]
                        ] = parameter[k] + indexOffset;
                        gas = Math.max(gas, parameter[k]);
                    }
                    this._indexAmount += parameter.length;
                    indexOffset += gas + 1;
                } else {
                    if (!object.isVisible && params[i].type === "mesh") {
                        // Hide mesh
                        for (let k = 0; k < parameter.length; k++) {
                            this._valueList[params[i].name][positionId++ + j * this._parameterLength[params[i].name]] = 0;
                        }
                    } else {
                        // Put element's vertex in chunk vertex array
                        for (let k = 0; k < parameter.length; k++) {
                            this._valueList[params[i].name][positionId++ + j * this._parameterLength[params[i].name]] = parameter[k];
                        }
                    }
                }
            }

            // Upload buffer to GPU
            if (params[i].type === "index") {
                if (this._isObjectListChanged) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._bufferList[params[i].name]);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._valueList[params[i].name], gl.DYNAMIC_DRAW);
                }
            } else {
                gl.bindBuffer(gl.ARRAY_BUFFER, this._bufferList[params[i].name]);
                gl.bufferData(gl.ARRAY_BUFFER, this._valueList[params[i].name], gl.DYNAMIC_DRAW);
            }
        }

        this._isObjectListChanged = false;
    }

    public draw(): void {
        const gl = this._blastGl.renderer.gl;

        // Set shader
        gl.useProgram(this.material.shader.program);
        this.material.shader.enableVertexAttribArray();

        // Get properties for material
        const params = this._material.shaderPropertyList;

        for (let i = 0; i < params.length; i++) {
            switch (params[i].type) {
                case "index":
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._bufferList[params[i].name]);
                    break;
                case "camera":
                    gl.uniformMatrix4fv(this.material.shader.getUniformLocation(params[i].name),
                        false, this.camera.matrix.matrix);
                    break;
                case "background":
                    // Bind texture
                    gl.activeTexture(gl.TEXTURE0 + params[i].slot);
                    gl.uniform1i(gl.getUniformLocation(this.material.shader.program, params[i].name), params[i].slot);
                    gl.bindTexture(gl.TEXTURE_2D, this._blastGl.scene.gag ?this._blastGl.scene.tt2.texture :this._blastGl.scene.tt.texture);
                    break;
                case "texture":
                    // Bind texture
                    gl.activeTexture(gl.TEXTURE0 + params[i].slot);
                    gl.uniform1i(gl.getUniformLocation(this.material.shader.program, params[i].name), params[i].slot);
                    gl.bindTexture(gl.TEXTURE_2D, this.material.textureList[params[i].slot].texture);
                    break;
                case "screenUv":
                case "uv":
                case "mesh":
                case "float":
                    gl.bindBuffer(gl.ARRAY_BUFFER, this._bufferList[params[i].name]);
                    gl.vertexAttribPointer(
                        this.material.shader.getAttributeLocation(params[i].name),
                        params[i].size,
                        gl.FLOAT, false, 0, 0
                    );
                    break;
                case "time":
                    gl.uniform4fv(this.material.shader.getUniformLocation(params[i].name),
                        new Float32Array([
                            this._blastGl.info.tickId, 1, 1, 1
                        ]));
                    break;
                default:
                    console.error(`Unsupported type "${params[i].type}"`);
                    break;
            }
        }

        // Отрисовка чанка
        gl.drawElements(gl.TRIANGLES, this._indexAmount, gl.UNSIGNED_SHORT, 0);
    }

    public reset(): void {
        this._material = null;
        this._indexAmount = 0;
        this._parameterLength = {};
        this._parameterDataLength = {};
        this._valueList = {};
        this._bufferList = {};
        this._objectList = [];
    }

    get size(): number {
        return this._objectList.length;
    }
}