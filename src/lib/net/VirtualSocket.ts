export default class VirtualSocket {
    public location: string;
    public port: number;
    public type: "web" | "tcp";
    private _eventList: { [key: string]: Function[] } = {};
    private _socket: WebSocket;

    constructor(location: string, port: number, type: "web" | "tcp" = "web") {
        this.location = location;
        this.port = port;
        this.type = type;
    }

    async open(): Promise<VirtualSocket> {
        return new Promise(((resolve: Function, reject: Function) => {
            if (this.type === "web") {
                this._socket = new WebSocket(`ws://${this.location}:${this.port}`);

                this._socket.onopen = (): void => {
                    resolve(this);
                };

                this._socket.onmessage = (e: MessageEvent): void => {
                    this.emit('data', e.data);
                };

                this._socket.onclose = (): void => {
                    this.emit('close');
                };

                this._socket.onerror = (): void => {
                    this.emit('error');
                };
            } else {
                reject(`Unsupported socket type`);
            }
        }));
    }

    send(data: string | Uint8Array | {}): void {
        if (typeof data === "object" && !(data instanceof Uint8Array)) {
            data = JSON.stringify(data);
        }

        this._socket.send(data as string);
    }

    on(event: string, fn: Function): void {
        if (!this._eventList[event]) {
            this._eventList[event] = [];
        }
        this._eventList[event].push(fn);
    }

    emit(event: string, ...data: string[]): void {
        if (!this._eventList[event]) {
            return;
        }

        for (let i = 0; i < this._eventList[event].length; i++) {
            this._eventList[event][i](...data);
        }
    }
}