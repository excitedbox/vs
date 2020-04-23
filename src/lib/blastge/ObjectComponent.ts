import GameObject from "./GameObject";

export default class ObjectComponent {
    public _components: ObjectComponent[] = [];
    public gameObject: GameObject;

    start(): void {

    }

    update(delta: number): void {
        for (let i = 0; i < this._components.length; i++) {
            this._components[i].update(delta);
        }
    }

    getComponent(component: Function): ObjectComponent {
        for (let i = 0; i < this._components.length; i++) {
            if (this._components[i] instanceof component) {
                return this._components[i];
            }
        }
    }

    addComponent(gameObject: GameObject, component: ObjectComponent): void {
        component.gameObject = gameObject;
        this._components.push(component);
        component.start();
    }

    removeComponent(component: ObjectComponent): void {
        const index = this._components.indexOf(component);
        if (index !== -1) {
            this._components.splice(index, 1);
        }
    }
}