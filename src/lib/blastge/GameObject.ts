import RenderObject from "../blastgl/render/RenderObject";
import World from "./World";
import Scene from "../blastgl/scene/Scene";
import ObjectComponent from "./ObjectComponent";
import ColliderComponent from "./ColliderComponent";

export default class GameObject {
    public renderObject: RenderObject;
    public readonly world: World;
    public readonly components: ObjectComponent[] = [];
    private _isRemoved: boolean = false;

    constructor(scene: Scene, world: World) {
        this.world = world;
    }

    public start(): void {

    }

    public update(delta: number): void {
        for (let i = 0; i < this.components.length; i++) {
            this.components[i].update(delta);
        }
    }

    getComponent(component: Function): ObjectComponent {
        for (let i = 0; i < this.components.length; i++) {
            if (this.components[i] instanceof component) {
                return this.components[i];
            }
        }
    }

    addComponent(component: ObjectComponent): void {
        // @ts-ignore
        component.gameObject = this;
        this.components.push(component);
        component.start();
    }

    removeComponent(component: ObjectComponent): void {
        const index = this.components.indexOf(component);
        if (index !== -1) {
            this.components.splice(index, 1);
        }
    }

    onCollision(collider: ColliderComponent): void {

    }

    destroy(): void {
        this._isRemoved = true;
    }

    get isRemoved(): boolean {
        return this._isRemoved;
    }
}