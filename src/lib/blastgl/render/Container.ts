import ShapeObject from "./ShapeObject";
import BlastGL from "../BlastGL";

export default class Container extends ShapeObject {
    public readonly elements: ShapeObject[] = [];
    private _vertex: number[] = [];

    // Добавить объект в контейнер
    addObject(element: ShapeObject): void {
        this.elements.push(element);
    };

    // Удалить объект из контейнера
    removeObject(element: ShapeObject): void {
        const index = this.elements.indexOf(element);
        if (index !== -1) {
            this.elements.splice(index, 1);
        }
    };

    set width(value: number) {
        return;
    }

    get width(): number {
        if (!this.elements.length) {
            return 0;
        }
        let minX = Number.MAX_SAFE_INTEGER;
        let maxX = Number.MIN_SAFE_INTEGER;

        for (let i = 0; i < this.elements.length; i++) {
            minX = Math.min(this.elements[i].x - this.elements[i].width / 2, minX);
            maxX = Math.max(this.elements[i].x + this.elements[i].width / 2, maxX);
        }
        const a = minX - maxX;
        const b = 0;
        return Math.sqrt(a * a + b * b);
    }

    set height(value: number) {
        return;
    }

    get height(): number {
        if (!this.elements.length) {
            return 0;
        }
        let minY = Number.MAX_SAFE_INTEGER;
        let maxY = Number.MIN_SAFE_INTEGER;

        for (let i = 0; i < this.elements.length; i++) {
            minY = Math.min(this.elements[i].y - this.elements[i].height / 2, minY);
            maxY = Math.max(this.elements[i].y + this.elements[i].height / 2, maxY);
        }
        const a = 0;
        const b = minY - maxY;
        return Math.sqrt(a * a + b * b);
    }

    update(delta: number): void {
        if (this.isRemoved) {
            return;
        }

        this.matrix.identity();
        if (this.parent) {
            this.matrix.concat(this.parent.matrix);
        }
        this.matrix.translate(this.x, this.y, 0);
        this.matrix.rotate(-this.rotation);
        this.matrix.scale(this.width * this.scaleX, this.height * this.scaleY, 1);

        // Рассчет вертекса
        this._vertex[0] = -0.5 * this.matrix.matrix[0] + -0.5 * this.matrix.matrix[4] + this.matrix.matrix[8] + this.matrix.matrix[12];
        this._vertex[1] = -0.5 * this.matrix.matrix[1] + -0.5 * this.matrix.matrix[5] + this.matrix.matrix[9] + this.matrix.matrix[13];
        this._vertex[2] = 0.5 * this.matrix.matrix[0] + -0.5 * this.matrix.matrix[4] + this.matrix.matrix[8] + this.matrix.matrix[12];
        this._vertex[3] = 0.5 * this.matrix.matrix[1] + -0.5 * this.matrix.matrix[5] + this.matrix.matrix[9] + this.matrix.matrix[13];
        this._vertex[4] = 0.5 * this.matrix.matrix[0] + 0.5 * this.matrix.matrix[4] + this.matrix.matrix[8] + this.matrix.matrix[12];
        this._vertex[5] = 0.5 * this.matrix.matrix[1] + 0.5 * this.matrix.matrix[5] + this.matrix.matrix[9] + this.matrix.matrix[13];
        this._vertex[6] = -0.5 * this.matrix.matrix[0] + 0.5 * this.matrix.matrix[4] + this.matrix.matrix[8] + this.matrix.matrix[12];
        this._vertex[7] = -0.5 * this.matrix.matrix[1] + 0.5 * this.matrix.matrix[5] + this.matrix.matrix[9] + this.matrix.matrix[13];

        this.matrix.scale(1 / this.width, 1 / this.height, 1);

        // Новый рассчет области
        this.area.top = Math.max(this._vertex[1], this._vertex[3], this._vertex[5], this._vertex[7]);
        this.area.left = Math.min(this._vertex[0], this._vertex[2], this._vertex[4], this._vertex[6]);
        this.area.bottom = Math.min(this._vertex[1], this._vertex[3], this._vertex[5], this._vertex[7]);
        this.area.right = Math.max(this._vertex[0], this._vertex[2], this._vertex[4], this._vertex[6]);

        // Если контейнер изменился, то удалить кэш из дочерних элементов
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i].update(delta);
        }
    }

    destroy(): void {
        this.isRemoved = true;
        this.blastGl.scene.isNeedGarbageCollector = true;
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i].destroy();
        }
    };
}