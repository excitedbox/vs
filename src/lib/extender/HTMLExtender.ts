declare global {
    interface HTMLElement {
        on(eventList, fn, params?);
    }

    interface Document {
        on(eventList, fn, params?);
    }
}

Document.prototype.on = HTMLElement.prototype.on = function (eventList, fn, params?) {
    let list = eventList.split(' ');
    for (let i = 0; i < list.length; i++) {
        this.addEventListener(list[i], fn, params);
    }
};

export default class HTMLExtender {
}