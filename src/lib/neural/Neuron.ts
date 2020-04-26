export default class Neuron {

    public inputList: number[] = [];
    public weightList: number[] = [];
    private _k: number = 0;
    private _size: number = 0;
    private _type: string;
    private _out: number;

    constructor(type: string, size: number) {
        this.weightList.length = size;
        this.inputList.length = size;
        this._size = size;
        this._type = type;

        for (let i = 0; i < size; i++) {
            this.weightList[i] = Math.random() * 2 - 1;
        }
    }

    put(value: number): void {
        this.inputList[this._k++] = value;
    }

    correct(delta: number): void {
        for (let i = 0; i < this._size; i++) {
            this.weightList[i] = this.weightList[i] - this.inputList[i] * delta * 0.22;
        }
    }

    correctHidden(delta: number): void {
        for (let i = 0; i < this._size; i++) {
            const error = this.weightList[i] * delta;
            const weight_delta = error * (this._out * (1 - this._out));
            this.weightList[i] = this.weightList[i] - this.inputList[i] * weight_delta * 0.22;
        }
    }

    reset(): void {
        this._k = 0;
    }

    calculate(): number {
        if (this._type === 'input') {
            return this.inputList[0];
        }

        let out = 0;

        for (let i = 0; i < this.inputList.length; i++) {
            out += this.inputList[i] * this.weightList[i];
        }

        out = 1 / (1 + Math.exp(-out));

        this._out = out;

        return out;
    }
}