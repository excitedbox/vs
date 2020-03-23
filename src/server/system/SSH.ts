import * as ssh from 'ssh2';

const Client = ssh.Client;

export default class SSH {
    private _stream: ssh.ClientChannel;
    private _eventList: { [key: string]: Function[] } = {};

    constructor(stream: ssh.ClientChannel) {
        this._stream = stream;
        this._stream.on('data',  (data: string) => {
            this.emit('data', data);
        });
    }

    write(str: string): void {
        this._stream.write(str);
    }

    static start(host: string, username: string, password: string): Promise<SSH> {
        return new Promise<SSH>((resolve: Function, reject: Function) => {
            const conn = new Client();
            conn.on('ready', (): void => {
                conn.shell((err: Error, stream: ssh.ClientChannel): void => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    stream.on('close', () => {
                        conn.end();
                    });

                    resolve(new SSH(stream));

                    /*stream.on('close', function () {
                        console.log('Stream :: close');
                        conn.end();
                    }).on('data', function (data) {
                        console.log('OUTPUT: ' + data);
                    });*/
                });
            }).connect({
                host,
                port: 22,
                username,
                password
            });
        });

        /*conn.on('ready', function () {
            console.log('Client :: ready');

            conn.shell(function (err, stream) {
                if (err) {
                    throw err;
                }
                stream.on('close', function () {
                    console.log('Stream :: close');
                    conn.end();
                }).on('data', function (data) {
                    console.log('OUTPUT: ' + data);
                });

                stream.write('l');
                stream.write('s');
                stream.write('\n');
                // stream.end('ls -l\nexit\n');
            });
        }).connect({
            host,
            port: 22,
            username,
            password
        });*/
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