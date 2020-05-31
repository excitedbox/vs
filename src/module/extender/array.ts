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
        gap(): T[];

        /**
         * [{a:1, b:2},{a:1, b:2},{a:1, b:2}] extract a -> [1, 1, 1]
         */
        extractField(field: string): T[];

        /**
         * Remove specific value from array
         */
        clean(deleteValue: unknown): T[];

        /**
         * Sort array by specific field
         */
        sortBy(field: string, isReverse?: boolean): T[];

        /**
         * Cut off array if it more than specified length
         */
        limit(amount: number): T[];

        /**
         * Clone array
         */
        clone(): T[];

        has(value: unknown): boolean;

        /**
         * Remove non unique values from array
         */
        unique(field?: string): T[];

        intersection(arr: T[]): T[];

        remove(value: unknown): boolean;

        clear(): void;
    }
}

Array.prototype.avg = function (field: string): number {
    let out = 0;
    for (let i = 0; i < this.length; i++) {
        if (field) {
            out += this[i][field] * 1;
        } else {
            out += this[i];
        }
    }
    return out / this.length;
};

Array.prototype.sum = function (field: string): number {
    let out = 0;
    for (let i = 0; i < this.length; i++) {
        if (field) {
            out += this[i][field] * 1;
        } else {
            out += this[i];
        }
    }
    return out;
};

Array.prototype.gap = function (): number[] {
    const out = [];
    for (let i = 0; i < this.length - 1; i++) {
        const a = this[i];
        const b = this[i + 1];
        out.push(b - a);
    }
    return out;
};

Array.prototype.extractField = function (field: string): unknown[] {
    const out = [];
    for (let i = 0; i < this.length; i++) {
        out.push(this[i][field]);
    }
    return out;
};

Array.prototype.clean = function (deleteValue: unknown): unknown[] {
    for (let i = 0; i < this.length; i++) {
        if (this[i] === deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};

Array.prototype.sortBy = function (field: string, isReverse: boolean = false): unknown[] {
    this.sort(function (a: unknown, b: unknown) {
        if (typeof a[field] === "string") {
            return a[field].localeCompare(b[field]);
        }
        return (a[field] > b[field]) ? 1 : ((b[field] > a[field]) ? -1 : 0);
    });
    if (isReverse) {
        return this.reverse();
    }
    return this;
};

Array.prototype.has = function (value: unknown): boolean {
    return this.indexOf(value) !== -1;
};

Array.prototype.limit = function (value: number): unknown[] {
    if (this.length > value) {
        this.length = value;
    }
    return this;
};

Array.prototype.clone = function (): unknown[] {
    return [].concat(this);
};

Array.prototype.unique = function (field: string = null): unknown[] {
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
    return this.filter(function (value: unknown, index: number, self: unknown[]) {
        return self.indexOf(value) === index;
    });
};

Array.prototype.remove = function (value: unknown): boolean {
    const index = this.indexOf(value);
    if (index !== -1) {
        this.splice(index, 1);
        return true;
    }
    return false;
};

Array.prototype.intersection = function (arr: unknown[]): unknown[] {
    const out = [];
    const maxArr = this.length > arr.length ? this : arr;
    const minArr = this.length > arr.length ? arr : this;

    for (let i = 0; i < maxArr.length; i++) {
        if (minArr.includes(maxArr[i])) {
            out.push(maxArr[i]);
        }
    }

    return out;
};

Array.prototype.clear = function (): void {
    this.length = 0;
};

export default class ArrayExtender {
}