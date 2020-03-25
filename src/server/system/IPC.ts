import {ChildProcess} from "child_process";
import ServiceMessage from "./ServiceMessage";

export default class IPC {
    private static _serviceList: Map<string, ChildProcess> = new Map<string, ChildProcess>();
    private static _messageCounter: number = 0;
    private static _callback: Map<number, Function> = new Map<number, Function>();

    static addService(name: string, service: ChildProcess): void {
        IPC._serviceList.set(name, service);

        service.on('message', (message: Buffer) => {
            const msg = ServiceMessage.from(message);

            if (this._callback.get(msg.id)) {
                this._callback.get(msg.id)(msg.data);
            }
        });

        service.on('exit', (code: number) => {
            console.log(`Process ${name} died! Code: ${code}`);
        });
    }

    static async send(service: string, type: "string" | "json" | "binary", data: string | {[key: string]: {}} | Buffer): Promise<string | {[key: string]: {}} | Buffer> {
        if (!IPC._serviceList.has(service)) {
            throw new Error(`Service "${service}" not found!`);
        }

        const messageId = IPC._messageCounter++;
        const message = new ServiceMessage(messageId, type, data);
        IPC._serviceList.get(service).send(message.encode());

        return new Promise(((resolve: Function) => {
            this._callback.set(messageId, resolve);
        }));
    }
}