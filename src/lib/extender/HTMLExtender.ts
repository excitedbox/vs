// global
declare global {
    interface HTMLImageElement {
        toJPEG();
    }

    interface Element {
        on(eventList, fn, params?);
        off(eventList, fn);
        setDraggable();
    }

    interface Document {
        on(eventList, fn, params?);
        off(eventList, fn);
    }
}

Document.prototype.on = Element.prototype.on = function (eventList, fn, params?) {
    let list = eventList.split(' ');
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
    let list = eventList.split(' ');
    for (let i = 0; i < list.length; i++)
        this.removeEventListener(list[i], fn);

    return fn;
};

HTMLElement.prototype.setDraggable = function () {
    let element: HTMLElement = this;

    element.style.position = 'relative';
    let startPos = {
        x: element.getBoundingClientRect().left,
        y: element.getBoundingClientRect().top
    };
    let startSize = {
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
        let touches = e.changedTouches || [];
        if (touches.length > 1) {
            let a = touches[0].pageX - touches[1].pageX;
            let b = touches[0].pageY - touches[1].pageY;
            startScale = Math.sqrt(a * a + b * b) - currentScale;
        }
        return false;
    }, {passive: false});
    document.on('mousemove touchmove', (e) => {
        if (!isDrag) return false;
        e.preventDefault();
        let touches = e.changedTouches || [];
        if (touches.length > 1) {
            let a = touches[0].pageX - touches[1].pageX;
            let b = touches[0].pageY - touches[1].pageY;
            currentScale = Math.sqrt(a * a + b * b) / 100;

            element.style.transform = `scale(${currentScale})`;
        } else {
            element.style.left = e.pageX - startPos.x + 'px';
            element.style.top = e.pageY - startPos.y + 'px';
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
        let canvas = document.createElement('canvas');
        canvas.setAttribute("width", this.width);
        canvas.setAttribute("height", this.height);
        canvas.style.position = 'absolute';
        canvas.style.visibility = 'hidden';
        document.querySelector('body').appendChild(canvas);

        let ctx = canvas.getContext('2d');
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