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
        sortBy(field: string, isReverse: boolean): Array<T>;

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
        unique(field: string): Array<T>;
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

Array.prototype.sortBy = function (field: string, isReverse: boolean) {
    this.sort(function (a, b) {
        if (isReverse) return (a[field] > b[field]) ? -1 : ((b[field] > a[field]) ? 1 : 0);
        return (a[field] > b[field]) ? 1 : ((b[field] > a[field]) ? -1 : 0);
    });
    return this;
};

Array.prototype.limit = function (value: number) {
    if (this.length > value) this.length = value;
    return this;
};

Array.prototype.clone = function () {
    return [].concat(this);
};

Array.prototype.unique = function (field) {
    if (field) {
        let out = [];
        for (let i = 0; i < this.length; i++) {
            let isExist = false;
            for (let j = 0; j < out.length; j++) {
                if (out[j][field] === this[i][field]) {
                    isExist = true;
                    break;
                }
            }
            if (!isExist)
                out.push(this[i]);
        }
        return out;
    }
    return this.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });
};

// #ifdef nodejs
export default class ArrayExtender {
}
// #endif