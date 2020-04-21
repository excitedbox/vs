import Layer from "./Layer";
import ShapeObject from "../render/ShapeObject";
import Camera from "./Camera";
import BlastGL from "../BlastGL";

export default class Scene {
    public readonly layers: Layer[] = [];
    public isPaused: boolean = false;
    private _camera: Camera;
    public blastGl: BlastGL;
    public isNeedGarbageCollector: boolean = false;

    init(): void {

    }

    get camera(): Camera {
        return this._camera;
    }

    set camera(camera: Camera) {
        this._camera = camera;
    }

    addObject(object: ShapeObject, layerId: number = 0): void {
        // Ищем слой с указанным id
        let layer = null;
        for (let i = 0; i < this.layers.length; i++) {
            if (this.layers[i].id === layerId) {
                layer = this.layers[i];
                break;
            }
        }

        // Если такого слоя нет, создаем
        if (!layer) {
            layer = new Layer(layerId);
            this.layers.push(layer);
        }

        // Добавляем элемент в слой
        if (layer.elements.indexOf(object) === -1) {
            layer.elements.push(object);
        }

        // Сортируем слои по id
        this.layers.sort(function (a: Layer, b: Layer) {
            return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);
        });
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
                tempElement.zIndex = -(i * 2) - (j / this.layers[i].elements.length);

                if (tempElement.update) {
                    tempElement.update(delta);
                }
            }
        }
    }

    destroy(): void {

    }
}