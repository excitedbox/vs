import ByteArray from "../../lib/util/ByteArray";

export default class ServiceMessage {
    public id: number;
    public type: "string" | "json" | "binary" | "error";
    public data: string | {[key: string]: {}} | Buffer;

    constructor(id: number, type: "string" | "json" | "binary" | "error", data: string | {[key: string]: {}} | Buffer ) {
        this.id = id;
        this.type = type;
        this.data = data;
    }

    encode(): Buffer {
        if (this.type === "binary") {
            const ss = Buffer.alloc(4 + 1 + 4 + (this.data as Buffer).length);
            ss.writeUInt32BE(this.id, 0);
            ss.writeUInt8(2, 4);
            ss.writeUInt32BE((this.data as Buffer).length, 5);
            ss.set((this.data as Buffer), 9);
            return ss;
        }

        if (this.type === "string") {
            // Allocate buffer
            const s = new ByteArray(4 + 1 + 4 + (this.data as string).length * 2);

            // Set package id
            s.putUInt32(this.id);
            s.putUInt8(0);
            s.putString(this.data as string);
            s.optimize();
            return Buffer.from(s.buffer);
        }
        if (this.type === "json") {
            const msg = JSON.stringify(this.data as string);

            // Allocate buffer
            const s = new ByteArray(4 + 1 + 4 + msg.length * 3);

            // Set package id
            s.putUInt32(this.id);
            s.putUInt8(1);
            s.putString(msg);
            s.optimize();
            return Buffer.from(s.buffer);
        }
        if (this.type === "error") {
            // Allocate buffer
            const s = new ByteArray(4 + 1 + 4 + (this.data as string).length * 2);

            // Set package id
            s.putUInt32(this.id);
            s.putUInt8(3);
            s.putString(this.data as string);
            s.optimize();
            return Buffer.from(s.buffer);
        }
    }

    static check(buffer: Buffer): number {
        try {
            const id = buffer.readUInt32BE(0);
            const type = buffer.readUInt8(4);
            const length = buffer.readUInt32BE(5);
            const data = buffer.subarray(9);

            if (data.length >= length) {
                return 4 + 1 + 4 + length;
            }
        }
        catch (e) {
            return 0;
        }

        return 0;
    }

    static from(buffer: Buffer): ServiceMessage {
        buffer = Buffer.from(buffer);
        const id = buffer.readUInt32BE(0);
        const type = buffer.readUInt8(4);
        const typeName = type === 0 ?"string" :type === 1 ?"json" :type === 2 ?"binary" :"error";
        const length = buffer.readUInt32BE(5);
        const data = buffer.subarray(9);

        try {
            const convertedData = (typeName === "string" || typeName === "error") ? data.toString('utf-8')
                : typeName === "json" ? JSON.parse(data.toString('utf-8')) : data;

            return new ServiceMessage(id, typeName, convertedData);
        }
        catch (e) {
            console.error(data.toString('utf-8'));
        }
    }
}