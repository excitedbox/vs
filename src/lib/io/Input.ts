export default class Input {
    private static _keys: Map<number, boolean> = new Map<number, boolean>();

    static init(): void {
        // Нажатия на клавиши
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            this._keys.set(event.keyCode, true);
        });

        document.addEventListener('keyup', (event: KeyboardEvent) => {
            this._keys.delete(event.keyCode);
        });
    }

    static isKeyDown(key: number): boolean {
        return this._keys.has(key);
    }
}