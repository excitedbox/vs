export default class Input {
    private static _keys: Map<number, boolean> = new Map<number, boolean>();
    private static _isMouseDown: boolean = false;
    private static _positionX: number = 0;
    private static _positionY: number = 0;

    static init(): void {
        // Нажатия на клавиши
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            this._keys.set(event.keyCode, true);
        });

        document.addEventListener('keyup', (event: KeyboardEvent) => {
            this._keys.delete(event.keyCode);
        });

        document.on('mousedown touchstart', (e: Event): void => {
            this._isMouseDown = true;
        });

        document.on('mouseup touchend', (e: Event): void => {
            this._isMouseDown = false;
        });

        document.on('mousemove touchmove', (e: MouseEvent | TouchEvent): void => {
            if (e instanceof MouseEvent) {
                this._positionX = e.pageX;
                this._positionY = e.pageY;
            }

            if (e instanceof TouchEvent) {
                this._positionX = e.changedTouches[0].pageX;
                this._positionY = e.changedTouches[0].pageY;
            }
        });
    }

    static isKeyDown(key: number): boolean {
        return this._keys.has(key);
    }

    static get isMouseDown(): boolean {
        return this._isMouseDown;
    }

    static get x(): number {
        return this._positionX;
    }

    static get y(): number {
        return this._positionY;
    }
}