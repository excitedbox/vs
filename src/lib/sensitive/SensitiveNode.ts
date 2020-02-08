import StringExtender from "../extender/StringExtender";

export default class SensitiveNode {
    public app: any;
    public node: HTMLElement;

    constructor(app: any, node: HTMLElement) {
        this.app = app;
        this.node = node;
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

    push(x: any) {
        this.app.buildTree(this.node, x);
    }

    pushIf(x: any, condition: boolean) {
        if (condition) this.push(x);
    }

    loop(target: any, fn: Function) {
        if (typeof target === "number") {
            for (let i = 0; i < target; i++) {
                this.push(fn(i));
            }
        }
    }

    on(event: string, fn: any) {
        let list = event.split(' ');
        for (let i = 0; i < list.length; i++)
            this.node.addEventListener(list[i], fn);
    }
}