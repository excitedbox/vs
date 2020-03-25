import ByteArray from "../../lib/util/ByteArray";

export default class ServiceMessage {
    public id: number;
    public type: "string" | "json" | "binary";
    public data: string | {[key: string]: {}} | Buffer;

    constructor(id: number, type: "string" | "json" | "binary", data: string | {[key: string]: {}} | Buffer ) {
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

        const s = new ByteArray();

        s.putUInt32(this.id);
        if (this.type === "string") {
            s.putUInt8(0);
        }
        if (this.type === "json") {
            s.putUInt8(1);
        }

        if (this.type === "string") {
            s.putString(this.data as string);
        }
        if (this.type === "json") {
            s.putString(JSON.stringify(this.data as string));
        }

        s.optimize();
        return Buffer.from(s.buffer);
    }

    static from(buffer: Buffer): ServiceMessage {
        buffer = Buffer.from(buffer);
        const id = buffer.readUInt32BE(0);
        const type = buffer.readUInt8(4);
        const typeName = type === 0 ?"string" :type === 1 ?"json" :"binary";
        const length = buffer.readUInt32BE(5);
        const data = buffer.slice(9);
        const convertedData = typeName === "string" ?data.toString('utf-8')
            :typeName === "json" ?JSON.parse(data.toString('utf-8')) :data;

        return new ServiceMessage(id, typeName, convertedData);
    }
}