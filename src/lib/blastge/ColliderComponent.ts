import ObjectComponent from "./ObjectComponent";
import Rectangle from "../math/geom/Rectangle";

export default class ColliderComponent extends ObjectComponent {
    public area: Rectangle;
    public rect: Rectangle;

    constructor(left: number = 0, top: number = 0, right: number = 1, bottom: number = 1) {
        super();

        this.area = new Rectangle(left, top, right, bottom);
        this.rect = new Rectangle(left, top, right, bottom);
    }

    start(): void {
        this.update(1);
    }

    update(delta: number): void {
        /*this.rect.left = this.area.left + this.gameObject.x;
        this.rect.right = this.area.right + this.gameObject.x;
        this.rect.top = this.area.top + this.gameObject.y;
        this.rect.bottom = this.area.bottom + this.gameObject.y;*/
    }
}