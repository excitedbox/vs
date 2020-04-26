import GameObject from "./GameObject";
import Scene from "../blastgl/scene/Scene";
import Vector2D from "../math/geom/Vector2D";
import ColliderComponent from "./ColliderComponent";

export default class World {
    public readonly elements: GameObject[] = [];
    public readonly scene: Scene;
    private readonly _colliderList: ColliderComponent[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
    }

    instantiate(gameObject: Function, position: Vector2D = null): unknown {
        // @ts-ignore
        const element = new gameObject(this.scene, this) as GameObject;
        if (element.renderObject && position) {
            element.renderObject.x = position.x;
            element.renderObject.y = position.y;
        }
        this.elements.push(element);
        return element;
    }

    step(delta: number): void {
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i].update(delta);
        }

        for (let i = 0; i < this._colliderList.length; i++) {
            const collider1 = this._colliderList[i];
            // console.log(collider1.rect);
            for (let j = 0; j < this._colliderList.length; j++) {
                const collider2 = this._colliderList[j];

                if (collider1 === collider2) {
                    continue;
                }

                if (collider1.rect.intersectRectangle(collider2.rect, true)) {
                    collider1.gameObject.onCollision(collider2);
                    collider2.gameObject.onCollision(collider1);
                }
            }
        }

        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].isRemoved) {
                // Destroy from render
                this.elements[i].renderObject.destroy();

                // Destroy each component
                for (let j = 0; j < this.elements[i].components.length; j++) {
                    this.elements[i].components[j].destroy();
                }

                // Remove from array
                this.elements.splice(i, 1);
                i -= 1;
            }
        }
    }

    addCollider(collider: ColliderComponent): void {
        this._colliderList.push(collider);
    }

    removeCollider(collider: ColliderComponent): void {
        this._colliderList.remove(collider);
    }
}