import ByteHelper from "../helper/ByteHelper";

export default class ByteArray {
    private readonly _buffer: Uint8Array;
    private readonly _capacity: number;
    private _order: string;
    private _position: number;
    private _tempFloatArray: Float32Array = new Float32Array(1);

    constructor(capacity: number = 1024, order: string = "big", array: any = null) {
        this._order = order;
        this._position = 0;
        this._capacity = array ? array.length : capacity;
        this._buffer = array || new Uint8Array(this._capacity);
    }

    put(data: Uint8Array) {
        for (let i = 0; i < data.length; i++)
            this.putUInt8(data[i]);
    }

    putUInt8(number: number) {
        if (number > 255) throw new Error(`Byte can't be > 255`);
        this._buffer[this._position++] = number;

        if (this._position > this._capacity)
            throw new Error('Out of range');
    }

    putUInt16(number: number) {
        if (number > 65535) throw new Error(`Byte can't be > 65535`);

        if (this._order === "big") {
            this._buffer[this._position++] = number >> 8;
            this._buffer[this._position++] = number & 0xFF;
        } else {
            this._buffer[this._position++] = number & 0xFF;
            this._buffer[this._position++] = number >> 8;
        }

        if (this._position > this._capacity)
            throw new Error('Out of range');
    }

    putUInt32(number: number) {
        if (number > 4294967295) throw new Error(`Byte can't be > 4294967295`);

        if (this._order === "big") {
            this._buffer[this._position++] = number >> 24;
            this._buffer[this._position++] = (number >> 16) & 0xFF;
            this._buffer[this._position++] = (number >> 8) & 0xFF;
            this._buffer[this._position++] = number & 0xFF;
        } else {
            this._buffer[this._position++] = number & 0xFF;
            this._buffer[this._position++] = (number >> 8) & 0xFF;
            this._buffer[this._position++] = (number >> 16) & 0xFF;
            this._buffer[this._position++] = number >> 24;
        }

        if (this._position > this._capacity)
            throw new Error('Out of range');
    }

    putUInt64(number: number) {
        const big = ~~(number / 0x0100000000);
        const low = (number % 0x0100000000);

        if (this._order === "big") {
            this.putUInt32(big);
            this.putUInt32(low);
        } else {
            this.putUInt32(low);
            this.putUInt32(big);
        }
    }

    putFloat(number: number) {
        this._tempFloatArray[0] = number;
        this.putUInt8(this._tempFloatArray.buffer[0]);
        this.putUInt8(this._tempFloatArray.buffer[1]);
        this.putUInt8(this._tempFloatArray.buffer[2]);
        this.putUInt8(this._tempFloatArray.buffer[3]);
    }

    putString(str: string) {
        let byteStr = new TextEncoder().encode(str);
        this.putUInt16(byteStr.length); // str len
        for (let i = 0; i < byteStr.length; i++)
            this.putUInt8(byteStr[i]);
    }

    /** Equally to putStr but doesn't contain length info */
    putChars(str: string) {
        let byteStr = new TextEncoder().encode(str);
        for (let i = 0; i < byteStr.length; i++)
            this.putUInt8(byteStr[i]);
    }

    getUInt8() {
        return this._buffer[this._position++];
    }

    getUInt16() {
        return (this._buffer[this._position++] << 8 |
            this._buffer[this._position++]);
    }

    getUInt32() {
        return (this._buffer[this._position++] * 16777216 +
            this._buffer[this._position++] * 65536 +
            this._buffer[this._position++] * 256 +
            this._buffer[this._position++]);
    }

    getUInt64() {
        let l = this.getUInt32();
        let h = this.getUInt32();
        return h + (l * 0x0100000000);
    }

    getString() {
        let len = this.getUInt16();
        let str = new TextDecoder().decode(this._buffer.slice(this._position, this._position + len));
        this._position += len;
        return str;
    }

    addUInt32(number) {
        let val = this.getUInt32() + number;
        this._position -= 4;
        this.putUInt32(val);
    }

    addUInt64(number) {
        let val = this.getUInt64() + number;
        this._position -= 8;
        this.putUInt64(val);
    }

    get position() {
        return this._position;
    }

    set position(pos) {
        if (pos > this._capacity) throw new Error(`OUT_OF_RANGE`);
        this._position = pos;
    }

    get buffer(): Uint8Array {
        return this._buffer;
    }

    print() {
        console.log(this._buffer);
    }

    get base64() {
        return ByteHelper.base64decode(this._buffer);
    }
}