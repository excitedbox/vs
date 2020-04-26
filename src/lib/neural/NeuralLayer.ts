import Neuron from "./Neuron";

export default class NeuralLayer {
    private _neurons: Neuron[] = [];
    private _inputSize: number;
    private _size: number;
    private _k: number = 0;
    private _type: string;

    constructor(type: string, neuronInput: number, size: number) {
        this._inputSize = neuronInput;
        this._type = type;
        this._size = size;

        for (let i = 0; i < size; i++) {
            this._neurons.push(new Neuron(type, neuronInput));
        }
    }

    put(values: number[]): void {
        for (let i = 0; i < values.length; i++) {
            this._neurons[this._k].put(values[i]);
        }

        this._k++;

        /*if (this._inputSize === 1) {

        } else {
            for (let i = 0; i < this._neurons.length; i++) {
                for (let j = 0; j < values.length; j++) {
                    this._neurons[i].put(values[j]);
                }
            }
        }*/
    }

    correct(value: number): void {
        for (let i = 0; i < this._neurons.length; i++) {
            this._neurons[i].correct(value);
        }
    }

    correctHidden(value: number): void {
        for (let i = 0; i < this._neurons.length; i++) {
            this._neurons[i].correctHidden(value);
        }
    }

    reset(): void {
        this._k = 0;

        for (let i = 0; i < this._neurons.length; i++) {
            this._neurons[i].reset();
        }
    }

    calculate(): number[] {
        const out = [];
        for (let i = 0; i < this._neurons.length; i++) {
            out.push(this._neurons[i].calculate());
        }
        return out;
    }

    get type(): string {
        return this._type;
    }

    get inputSize(): number {
        return this._inputSize;
    }

    get size(): number {
        return this._size;
    }
}