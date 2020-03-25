import {ChildProcess} from "child_process";
import ServiceMessage from "./ServiceMessage";
import Timeout = NodeJS.Timeout;
import Process = NodeJS.Process;

export default class IPC {
    private static _serviceList: Map<string, ChildProcess | Process> = new Map<string, ChildProcess | Process>();
    private static _messageCounter: number = 0;
    private static _callback: Map<number, Function> = new Map<number, Function>();
    private static _timeout: Map<number, Timeout> = new Map<number, Timeout>();

    static addService(name: string, service: ChildProcess | Process): void {
        IPC._serviceList.set(name, service);

        service.on('message', (message: Buffer) => {
            const msg = ServiceMessage.from(message);

            clearTimeout(this._timeout.get(msg.id));

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

        return new Promise(((resolve: Function, reject: Function) => {
            this._callback.set(messageId, resolve);

            this._timeout.set(messageId, setTimeout(() => {
                reject();
            }, 5000));
        }));
    }
}