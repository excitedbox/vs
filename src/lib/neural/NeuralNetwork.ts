import NeuralLayer from "./NeuralLayer";

export default class NeuralNetwork {
    private _layers: NeuralLayer[] = [];

    addLayer(layer: NeuralLayer): void {
        this._layers.push(layer);
    }

    train(trainSet: number[][], need: number[]): void {
        for (let i = 0; i < trainSet.length; i++) {
            const set = trainSet[i];
            let lastOutput: number[] = [];
            let error = 0;
            let weight_delta = 0;

            for (let j = 0; j < this._layers.length; j++) {
                const layer = this._layers[j];

                layer.reset();

                // If it input then pass set data
                if (layer.type === "input") {
                    for (let k = 0; k < layer.size; k++) {
                        layer.put([set[k]]);
                    }
                } else
                if (layer.type === "hidden") {
                    for (let k = 0; k < layer.size; k++) {
                        layer.put(lastOutput);
                    }
                } else
                if (layer.type === "output") {
                    for (let k = 0; k < layer.size; k++) {
                        layer.put(lastOutput);
                    }
                }

                lastOutput = layer.calculate();
            }

            for (let j = this._layers.length - 1; j >= 0; j--) {
                const layer = this._layers[j];

                if (layer.type === "output") {
                    error = (lastOutput[0] - need[i]);
                    weight_delta = error * (lastOutput[0] * (1 - lastOutput[0]));
                    layer.correct(weight_delta);
                }

                if (layer.type === "hidden") {
                    layer.correctHidden(weight_delta);
                }
            }

            /*l1.reset();
            l1.put([set[0]]);
            l1.put([set[1]]);
            l1.put([set[2]]);
            const l1out = l1.calculate();

            l2.reset();
            l2.put(l1out);
            l2.put(l1out);
            l2.put(l1out);
            const l2out = l2.calculate();

            l3.reset();
            l3.put(l2out);
            l3out = l3.calculate();

            if (j % 1000 === 0) {
                console.log(l3out, need[i], error);
            }

            error = (l3out[0] - need[i]);
            weight_delta = error * (l3out[0] * (1 - l3out[0]));
            l3.correct(weight_delta);

            l2.correctX(weight_delta);*/
        }
    }

    predict(value: number | number[]): void {
        let lastOutput: number[] = [];

        for (let j = 0; j < this._layers.length; j++) {
            const layer = this._layers[j];

            layer.reset();

            // If it input then pass set data
            if (layer.type === "input") {
                for (let k = 0; k < layer.size; k++) {
                    layer.put([value[k]]);
                }
            } else
            if (layer.type === "hidden") {
                for (let k = 0; k < layer.size; k++) {
                    layer.put(lastOutput);
                }
            } else
            if (layer.type === "output") {
                for (let k = 0; k < layer.size; k++) {
                    layer.put(lastOutput);
                }
            }

            lastOutput = layer.calculate();
        }

        console.log(lastOutput);
    }
}