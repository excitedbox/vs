import SensitiveNode from "./SensitiveNode";

export default class SensitiveApplication {
    public storage: any;
    public rootNode: HTMLElement;
    private __globalWatcher: Map<any, any> = new Map<any, any>();

    constructor(id: string, storage: any) {
        this.rootNode = document.querySelector(id);
        this.storage = new storage();
        this.__initStorage();
    }

    private __initStorage() {
        let gThis = this;

        let storageChangeHandler = {
            set: function (target, property, value, receiver) {
                if ((Array.isArray(value) || typeof value === "object") && value !== null && value !== undefined) {
                    target[property] = new Proxy(value, storageChangeHandler);

                    if (Array.isArray(value)) {
                        for (let i = 0; i < value.length; i++) {
                            value[i] = new Proxy(value[i], storageChangeHandler);
                        }
                    }
                } else {
                    if (target[property] === value) return true;
                    target[property] = value;
                }

                if (gThis.__globalWatcher.has(receiver)) {
                    let set = gThis.__globalWatcher.get(receiver);
                    set.forEach(x => {
                        if (x.__prop === null) {
                            x.innerHTML = '';
                            gThis.buildTree(x, x.__tree);
                        }
                        if (x.__prop !== null) {
                            if (Array.isArray(x.__prop)) {
                                if (x.__prop.includes(property)) {
                                    x.innerHTML = '';
                                    gThis.buildTree(x, x.__tree);
                                }
                            } else if (x.__prop == property) {
                                x.innerHTML = '';
                                gThis.buildTree(x, x.__tree);
                            }
                        }
                    });
                }
                return true;
            }
        };

        this.storage = new Proxy(this.storage, storageChangeHandler);
        for (let s in this.storage) {
            if (Array.isArray(this.storage[s])) {
                this.storage[s] = new Proxy(this.storage[s], storageChangeHandler);
            }
        }
    }

    setUI(ui: Function) {
        this.buildTree(this.rootNode, ui(this, this.storage));
    }

    public buildTree(node: HTMLElement, tree: any) {
        if (typeof tree === 'function') {
            node['__tree'] = tree;
            let sensitiveNode = new SensitiveNode(this, node);
            let status = tree(sensitiveNode);
            if (status === false) node['__parent'].removeChild(node);
            else if (status !== false && node['__hidden']) {
                node['__parent'].appendChild(node);
            }
            return;
        }

        /*let position = 0;
        for (let key in tree) {
            if (!tree.hasOwnProperty(key)) continue;
            if (node.childNodes[position]) node.removeChild(node.childNodes[position]);
            position++;
        }*/

        for (let key in tree) {
            if (!tree.hasOwnProperty(key)) continue;

            let keyTuple = key.split(' ');
            let elementType = 'div';
            if (keyTuple[0][0] !== '.') elementType = keyTuple.shift();
            let classList = keyTuple.map(x => x.replace('.', '')).join(' ');

            let element = document.createElement(elementType);
            if (classList) element.setAttribute('class', classList);

            if (typeof tree[key] === 'function') {
                element['__tree'] = tree[key];
                element['__parent'] = node;
                let status = tree[key](new SensitiveNode(this, element));
                if (status !== false) {
                    node.appendChild(element);
                    // console.log(!!node.childNodes[position]);
                    // console.log(node.className);
                }
                else element['__hidden'] = true;
            } else {
                node.appendChild(element);
                this.buildTree(element, tree[key]);
            }
        }
    }

    get globalWatcher(): Map<any, any> {
        return this.__globalWatcher;
    }
}