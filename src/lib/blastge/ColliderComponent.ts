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
        this.gameObject.world.addCollider(this);
    }

    update(delta: number): void {
        // console.log('gas');
        this.rect.left = this.area.left + this.gameObject.renderObject.x;
        this.rect.right = this.area.right + this.gameObject.renderObject.x;
        this.rect.top = this.area.top + this.gameObject.renderObject.y;
        this.rect.bottom = this.area.bottom + this.gameObject.renderObject.y;

        // console.log(this.gameObject);
    }

    destroy(): void {
        this.gameObject.world.removeCollider(this);
    }
}