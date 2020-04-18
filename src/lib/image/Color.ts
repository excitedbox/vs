export default class Color {
    public r: number;
    public g: number;
    public b: number;
    public a: number;

    constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    static fromHex(value: string): Color {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
        return result ? new Color(
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255,
            1
        ) : null;
    }

    static randomColor(): Color {
        return new Color(
            Math.random(),
            Math.random(),
            Math.random(),
            1
        );
    }
}