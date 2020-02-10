import SensitiveNode from "./SensitiveNode";
import SensitiveChange from "./SensitiveChange";
import SensitiveComponent from "./SensitiveComponent";

export default class SensitiveApplication {
    public storage: any;
    public rootNode: HTMLElement;
    private __globalWatcher: WeakMap<any, Set<HTMLElement>> = new WeakMap<any, Set<HTMLElement>>();

    constructor(id: string, storage: any) {
        this.rootNode = document.querySelector(id);
        this.storage = new storage();
        this.storage = this.__deepProxy(this.storage);
    }

    private __deepProxy(obj: any) {
        if (!obj) return false;
        if (typeof obj !== "object") return false;

        let gThis = this;
        let reactHandler = {
            set: function (target, property, value, receiver) {
                if (target[property] === value) return true;

                let previousValue = target[property];
                let tryProxy = gThis.__deepProxy(value);
                if (tryProxy !== false) target[property] = tryProxy;
                else target[property] = value;
                let whatChanged = new SensitiveChange(property, value, previousValue);

                if (gThis.__globalWatcher.has(receiver)) {
                    let set = gThis.__globalWatcher.get(receiver);
                    set.forEach(x => {
                        if (x['__prop'] === null) {
                            //x.__sense.pushCounter = 0;
                            gThis.buildTree(x, x['__tree'], 0, whatChanged);
                            // gThis.clearNodes(x, x.__sense.pushCounter);
                            // x.__sense.pushCounter = 0;
                        }
                        if (x['__prop'] !== null) {
                            if (Array.isArray(x['__prop'])) {
                                if (x['__prop'].includes(property)) {
                                    //x.__sense.pushCounter = 0;
                                    gThis.buildTree(x, x['__tree'], 0, whatChanged);
                                    // gThis.clearNodes(x, x.__sense.pushCounter);
                                    // x.__sense.pushCounter = 0;
                                }
                            } else if (x['__prop'] == property) {
                                //x.__sense.pushCounter = 0;
                                gThis.buildTree(x, x['__tree'], 0, whatChanged);
                                // gThis.clearNodes(x, x.__sense.pushCounter);
                                // x.__sense.pushCounter = 0;
                            }
                        }
                    });
                }

                return true;
            }
        };

        // Proxy an object
        let newObj = new Proxy(obj, reactHandler);

        // Proxy all props deep
        for (let prop in newObj) {
            if (!newObj.hasOwnProperty(prop)) continue;
            let tryProxy = this.__deepProxy(newObj[prop]);
            if (tryProxy !== false) newObj[prop] = tryProxy;
        }

        return newObj;
    }

    setUI(component: any) {
        this.__initComponent(this.rootNode, component);
    }

    private __initComponent(node: HTMLElement, component: any, componentProps: any = {}, keyId: number = 0, whatChanged: SensitiveChange = null) {
        let s: SensitiveComponent = new component();
        s.props = componentProps;
        s.app = this;
        s.storage = this.storage;
        let tree = s.render();
        this.buildTree(node, tree, keyId, whatChanged, s);

        let sasai = [];
        let intervalId = [];
        s['__destroy'] = function () {
            s.destroy();
            for (let i = 0; i < sasai.length; i++) {
                document.off(sasai[i][0], sasai[i][1]);
            }
            for (let i = 0; i < intervalId.length; i++) {
                clearInterval(intervalId[i]);
            }
        };

        s.start({
            document: {
                on(event: string, fn: Function) {
                    document.on(event, fn);
                    sasai.push([event, fn]);
                },
                off(event: string, fn: Function) {
                    document.off(event, fn);
                }
            },
            setInterval: (fn, time, ...args) => {
                intervalId.push(setInterval(fn, time, ...args));
            }
        });
    }

    public buildTree(node: HTMLElement, tree: any, keyId: number = 0, whatChanged: SensitiveChange = null, cmp: SensitiveComponent = null) {
        if (typeof tree === 'function') {
            node['__tree'] = tree;
            let sensitiveNode = new SensitiveNode(this, node, whatChanged);
            node['__sense'] = sensitiveNode;
            let status = tree(sensitiveNode);
            // this.clearNodes(node, sensitiveNode.pushCounter);

            if (status === false) node['__parent'].removeChild(node);
            else if (status !== false && node['__hidden']) {
                node['__parent'].appendChild(node);
            }

            return;
        }

        for (let key in tree) {
            if (!tree.hasOwnProperty(key)) continue;

            if (key[0] === '@') {
                let component = tree[key][0];
                let componentProps = tree[key][1];
                this.__initComponent(node, component, componentProps, keyId, whatChanged);

                keyId++;
                continue;
            }

            let keyTuple = key.split(' ');
            let elementType = 'div';
            if (keyTuple[0][0] !== '.') elementType = keyTuple.shift();
            let classList = keyTuple.map(x => x.replace('.', '')).join(' ');

            let element = document.createElement(elementType);
            if (classList) element.setAttribute('class', classList);

            if (typeof tree[key] === 'function') {
                element['__tree'] = tree[key];
                element['__parent'] = node;
                element['__component'] = cmp;
                // this.__freeWatchNode(element);
                let sensitiveNode = new SensitiveNode(this, element, whatChanged);
                element['__sense'] = sensitiveNode;
                let status = tree[key](sensitiveNode);
                // this.clearNodes(element, sensitiveNode.pushCounter);

                if (status !== false) {
                    if (node.childNodes[keyId]) {
                        if (node.childNodes[keyId]['__component'])
                            node.childNodes[keyId]['__component'].__destroy();
                        node.replaceChild(element, node.childNodes[keyId]);
                    } else node.appendChild(element);
                } else element['__hidden'] = true;
            }

            keyId++;
        }
    }

    public clearNodes(node: HTMLElement, keyId: number = 0) {
        for (let i = keyId; i < node.childNodes.length; i++) {
            let nodeToRemove = node.childNodes[i];
            node.removeChild(nodeToRemove);
            if (nodeToRemove['__component'])
                nodeToRemove['__component'].__destroy();
            i--;
        }
    }

    get globalWatcher(): WeakMap<any, any> {
        return this.__globalWatcher;
    }
}