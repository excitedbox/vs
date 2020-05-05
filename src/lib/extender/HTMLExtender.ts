// global
declare global {
    interface HTMLImageElement {
        toJPEG();
    }

    interface Element {
        once(eventList, fn, params?);

        on(eventList, fn, params?);

        off(eventList, fn);

        setDraggable(params?: {});
    }

    interface Document {
        once(eventList, fn, params?);

        on(eventList, fn, params?);

        off(eventList, fn);
    }
}

const __onceCheckMap: Map<any, string[]> = new Map<any, string[]>();

Document.prototype.once = Element.prototype.once = function (eventList, fn, params?) {
    if (!__onceCheckMap.has(this)) {__onceCheckMap.set(this, []);}
    eventList = eventList.split(' ');

    for (let i = 0; i < eventList.length; i++) {
        // Check if event already exists
        if (__onceCheckMap.get(this).includes(eventList[i])) {continue;}
        __onceCheckMap.get(this).push(eventList[i]);

        // Add event once
        this.on(eventList[i], fn, params);
    }
};

Document.prototype.on = Element.prototype.on = function (eventList, fn, params?) {
    const list = eventList.split(' ');
    for (let i = 0; i < list.length; i++) {
        if (list[i] === `hold`) {
            let holdTimer;
            this.on('mousedown touchstart', (e) => {
                holdTimer = setTimeout(fn, 500);
            });
            document.on('mouseup touchend', (e) => {
                clearTimeout(holdTimer);
            });
        } else {
            this.addEventListener(list[i], fn, params);
        }
    }

    return fn;
};

Document.prototype.off = Element.prototype.off = function (eventList, fn) {
    const list = eventList.split(' ');
    for (let i = 0; i < list.length; i++)
        {this.removeEventListener(list[i], fn);}

    return fn;
};

HTMLElement.prototype.setDraggable = function (params: { positionType: string; onDrag?: Function } = {
    positionType: 'relative'
}): void {
    const element: HTMLElement = this;

    element.style.position = params.positionType;
    let startPos = {
        x: element.getBoundingClientRect().left,
        y: element.getBoundingClientRect().top
    };
    const startSize = {
        width: element.getBoundingClientRect().width,
        height: element.getBoundingClientRect().height
    };
    let isDrag = false;
    let startScale = 0;
    let currentScale = 0;

    element.on(`mousedown touchstart`, (e) => {
        isDrag = true;
        startPos = {
            x: e.pageX - ~~Number.parseInt(element.style.left),
            y: e.pageY - ~~Number.parseInt(element.style.top)
        };
        const touches = e.changedTouches || [];
        if (touches.length > 1) {
            const a = touches[0].pageX - touches[1].pageX;
            const b = touches[0].pageY - touches[1].pageY;
            startScale = Math.sqrt(a * a + b * b) - currentScale;
        }
        return false;
    }, {passive: false});

    document.on('mousemove touchmove', (e) => {
        if (!isDrag) {return false;}
        e.preventDefault();
        const touches = e.changedTouches || [];
        if (touches.length > 1) {
            const a = touches[0].pageX - touches[1].pageX;
            const b = touches[0].pageY - touches[1].pageY;
            currentScale = Math.sqrt(a * a + b * b) / 100;

            element.style.transform = `scale(${currentScale})`;
        } else {
            element.style.left = e.pageX - startPos.x + 'px';
            element.style.top = e.pageY - startPos.y + 'px';

            if (params.onDrag) {
                params.onDrag(e.pageX - startPos.x, e.pageY - startPos.y);
            }
        }

        return false;
    }, {passive: false});

    document.on('mouseup touchend', (e) => {
        isDrag = false;
        return false;
    });
};

HTMLImageElement.prototype.toJPEG = function () {
    return new Promise((resolve => {
        const canvas = document.createElement('canvas');
        canvas.setAttribute("width", this.width);
        canvas.setAttribute("height", this.height);
        canvas.style.position = 'absolute';
        canvas.style.visibility = 'hidden';
        document.querySelector('body').appendChild(canvas);

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(this, 0, 0, this.width, this.height);
        canvas.toBlob((blob) => {
            document.querySelector('body').removeChild(canvas);
            resolve(blob);
        }, 'image/jpeg');
    }));
};

export default class HTMLExtender {
}