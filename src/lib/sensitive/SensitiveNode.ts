import StringExtender from "../extender/StringExtender";
import SensitiveChange from "./SensitiveChange";

export default class SensitiveNode {
    public app: any;
    public node: HTMLElement;
    public whatChanged: SensitiveChange;
    public pushCounter: number = 0;

    constructor(app: any, node: HTMLElement, whatChanged: SensitiveChange) {
        this.app = app;
        this.node = node;
        this.whatChanged = whatChanged || new SensitiveChange();
    }

    watch(target, prop = null) {
        if (!this.app.globalWatcher.has(target))
            this.app.globalWatcher.set(target, new Set());

        this.node['__prop'] = prop;
        this.app.globalWatcher.get(target).add(this.node);
    }

    set content(value: any) {
        if (this.node instanceof HTMLImageElement) this.node.setAttribute('src', value);
        else this.node.innerHTML = value;
    }

    addClass(value: string) {
        let classList = new Set(this.node.getAttribute('class')?.split(' '));
        classList.add(value);
        this.node.setAttribute('class', Array.from(classList).join(' '));
    }

    removeClass(value: string) {
        let classList = new Set(this.node.getAttribute('class')?.split(' '));
        classList.delete(value);
        this.node.setAttribute('class', Array.from(classList).join(' '));
    }

    set style(value: any) {
        let ifNeedPixel = false;

        for (let propName in value) {
            if (!value.hasOwnProperty(propName)) continue;
            ifNeedPixel = !!propName.match(/margin|padding|left|top|bottom|right|width|height/g);
            if (ifNeedPixel) this.node.style[propName.camelToKebab()] = value[propName] + 'px';
            else this.node.style[propName.camelToKebab()] = value[propName];
        }
    }

    push(x: any, keyId: number = 0) {
        this.app.buildTree(this.node, x, keyId);
        this.pushCounter = keyId;
    }

    pushIf(x: any, condition: boolean, keyId: number = 0) {
        if (condition) this.push(x, keyId);
    }

    loop(target: any, fn: Function) {
        if (typeof target === "number") {
            for (let i = 0; i < target; i++) {
                this.push(fn(i), i);
            }
        }
    }

    trim(maxNodes: number) {
        this.app.clearNodes(this.node, maxNodes);
    }

    on(event: string, fn: any) {
        let list = event.split(' ');
        for (let i = 0; i < list.length; i++)
            this.node.addEventListener(list[i], fn);
    }
}