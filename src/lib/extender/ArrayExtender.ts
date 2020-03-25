import ByteHelper from "../helper/ByteHelper";

declare global {
    interface Array<T> {
        /**
         * Get average value from array
         */
        avg(field: string): number;

        /**
         * Calculate sum of array elements
         */
        sum(field: string): number;

        /**
         * [a, b, c] -> [b - a, c - b]
         */
        gap(): Array<T>;

        /**
         * [{a:1, b:2},{a:1, b:2},{a:1, b:2}] extract a -> [1, 1, 1]
         */
        extractField(field: string): Array<T>;

        /**
         * Remove specific value from array
         */
        clean(deleteValue: any): Array<T>;

        /**
         * Sort array by specific field
         */
        sortBy(field: string, isReverse?: boolean): Array<T>;

        /**
         * Cut off array if it more than specified length
         */
        limit(amount: number): Array<T>;

        /**
         * Clone array
         */
        clone(): Array<T>;

        /**
         * Remove non unique values from array
         */
        unique(field?: string): Array<T>;

        intersection(arr: Array<T>): Array<T>;

        remove(value: any): boolean;

        clear(): void;
    }

    interface Uint8Array {
        toBase64(): string;

        append(v: Uint8Array): Uint8Array;

        prepend(v: Uint8Array): Uint8Array;

        toUTF8(): string;
    }
}

Array.prototype.avg = function (field: string) {
    let out = 0;
    for (let i = 0; i < this.length; i++) {
        if (field) out += this[i][field] * 1;
        else out += this[i];
    }
    return out / this.length;
};

Array.prototype.sum = function (field: string) {
    let out = 0;
    for (let i = 0; i < this.length; i++) {
        if (field) out += this[i][field] * 1;
        else out += this[i];
    }
    return out;
};

Array.prototype.gap = function () {
    let out = [];
    for (let i = 0; i < this.length - 1; i++) {
        let a = this[i];
        let b = this[i + 1];
        out.push(b - a);
    }
    return out;
};

Array.prototype.extractField = function (field: string) {
    let out = [];
    for (let i = 0; i < this.length; i++) {
        out.push(this[i][field]);
    }
    return out;
};

Array.prototype.clean = function (deleteValue: any) {
    for (let i = 0; i < this.length; i++) {
        if (this[i] === deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};

Array.prototype.sortBy = function (field: string, isReverse: boolean = false) {
    this.sort(function (a, b) {
        if (typeof a[field] === "string") return a[field].localeCompare(b[field]);
        return (a[field] > b[field]) ? 1 : ((b[field] > a[field]) ? -1 : 0);
    });
    if (isReverse) return this.reverse();
    return this;
};

Array.prototype.limit = function (value: number) {
    if (this.length > value) this.length = value;
    return this;
};

Array.prototype.clone = function () {
    return [].concat(this);
};

Array.prototype.unique = function (field: string = null) {
    if (field) {
        const out = [];
        for (let i = 0; i < this.length; i++) {
            let isExist = false;
            for (let j = 0; j < out.length; j++) {
                if (out[j][field] === this[i][field]) {
                    isExist = true;
                    break;
                }
            }
            if (!isExist) {
                out.push(this[i]);
            }
        }
        return out;
    }
    return this.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });
};

Array.prototype.remove = function (value: any): boolean {
    let index = this.indexOf(value);
    if (index !== -1) {
        this.splice(index, 1);
        return true;
    }
    return false;
};

Array.prototype.intersection = function (arr: Array<any>) {
    let out = [];
    let maxArr = this.length > arr.length ? this : arr;
    let minArr = this.length > arr.length ? arr : this;

    for (let i = 0; i < maxArr.length; i++)
        if (minArr.includes(maxArr[i])) out.push(maxArr[i]);

    return out;
};

Array.prototype.clear = function (): void {
    this.length = 0;
};

Uint8Array.prototype.toBase64 = function () {
    return ByteHelper.base64encode(this);
};

Uint8Array.prototype.append = function (v: Uint8Array) {
    const c = new Uint8Array(this.length + v.length);
    c.set(this, 0);
    c.set(v, this.length);
    return c;
};

Uint8Array.prototype.prepend = function (v: Uint8Array) {
    let c = new Uint8Array(this.length + v.length);
    c.set(v, 0);
    c.set(this, v.length);
    return c;
};

Uint8Array.prototype.toUTF8 = function () {
    return new TextDecoder().decode(this);
};

export default class ArrayExtender {
}