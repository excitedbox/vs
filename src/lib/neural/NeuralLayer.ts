import Neuron from "./Neuron";

export default class NeuralLayer {
    private _neurons: Neuron[] = [];
    private _inputSize: number;
    private _k: number = 0;

    constructor(type: string, neuronInput: number, size: number) {
        this._inputSize = neuronInput;

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

    correctX(value: number): void {
        for (let i = 0; i < this._neurons.length; i++) {
            this._neurons[i].correctX(value);
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
}