import TextureManager from "../texture/TextureManager";

export default class Scene {
    public layers: any[] = [];
    private _textureManager: TextureManager;
    private _isPaused: boolean = false;

    init(): void {
        this._textureManager = new TextureManager(this.constructor.name);
        this._textureManager.init();
        console.log('Scene ' + this.constructor.name + ' is init!');
    }

    // Удаляем сцену и все элементы внутри
    destroy() {
        this._textureManager.destroy();
        this._textureManager = null;

        // Проходим по всем слоям и элемента и удаляем сразу
        for (let i = 0; i < this.layers.length; i++) {
            for (let j = 0; j < this.layers[i].elements.length; j++) {
                this.layers[i].elements[j].free();
            }
            this.layers[i].elements.length = 0;
        }
        this.layers.length = 0;
    };

    // Заморозить сцену
    pause() {
        this._isPaused = true;
    };

    // Разморозить
    resume() {
        this._isPaused = false;
    };

    // Просчет сцены
    calculate() {
        if (this._isPaused) {
            return;
        }
        this.update();
    };

    // Обновление сцены, именно этот метод нужно переопределять для обновления
    update() {
        // this.emit('update');
    };
}