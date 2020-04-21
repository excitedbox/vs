export default class Mesh {
    public index: Uint16Array;
    public vertex: Float32Array;
    public uv: Float32Array[];

    constructor(index: Uint16Array, vertex: Float32Array, uv: Float32Array[]) {
        this.index = index;
        this.vertex = vertex;
        this.uv = uv;
    }
}