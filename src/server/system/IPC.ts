import ServiceMessage from "./ServiceMessage";
import Timeout = NodeJS.Timeout;
import {Socket} from "net";

export default class IPC {
    private static _serviceList: Map<string, Socket> = new Map<string, Socket>();
    private static _messageCounter: number = 0;
    private static _callback: Map<number, Function> = new Map<number, Function>();
    private static _errorCallback: Map<number, Function> = new Map<number, Function>();
    private static _timeout: Map<number, Timeout> = new Map<number, Timeout>();
    private static _buffer: Buffer = Buffer.alloc(0);

    static addService(name: string, service: Socket): void {
        IPC._serviceList.set(name, service);

        service.on('data', (message: Buffer) => {
            // Put data to buffer
            this._buffer = Buffer.from(this._buffer.append(new Uint8Array(message.buffer)));

            while (true) {
                // console.log('buff', this._buffer.length);

                // Check if have full message
                const size = ServiceMessage.check(this._buffer);
                //console.log('size', size);
                if (size) {
                    const msg = ServiceMessage.from(this._buffer.slice(0, size));
                    this._buffer = this._buffer.slice(size, this._buffer.length);

                    clearTimeout(this._timeout.get(msg.id));

                    if (msg.type === "error") {
                        if (this._errorCallback.get(msg.id)) {
                            this._errorCallback.get(msg.id)(msg.data);
                        }
                    } else {
                        if (this._callback.get(msg.id)) {
                            this._callback.get(msg.id)(msg.data);
                        }
                    }

                    this._callback.delete(msg.id);
                    this._errorCallback.delete(msg.id);
                } else {
                    break;
                }
            }
        });

        service.on('close', (code: number) => {
            console.log(`Process ${name} died! Code: ${code}`);
        });
    }

    static send(service: string, type: "string" | "json" | "binary", data: string | {[key: string]: {}} | Buffer): Promise<string | {[key: string]: {}} | Buffer> {
        if (!IPC._serviceList.has(service)) {
            throw new Error(`Service "${service}" not found!`);
        }

        const messageId = IPC._messageCounter++;
        const message = new ServiceMessage(messageId, type, data);
        IPC._serviceList.get(service).write(message.encode());

        return new Promise(((resolve: Function, reject: Function) => {
            this._callback.set(messageId, resolve);
            this._errorCallback.set(messageId, reject);

            this._timeout.set(messageId, setTimeout(() => {
                reject('Timeout');
            }, 5000));
        }));
    }
}