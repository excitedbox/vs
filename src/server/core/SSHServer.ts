import * as WebSocket from 'ws';
import SSH from "../system/SSH";

export default class SSHServer {

    private static _wss: WebSocket.Server;

    static async run(port: number): Promise<void> {
        SSHServer._wss = new WebSocket.Server({port});
        SSHServer._wss.on('connection', (ws: WebSocket) => {
            let isFirst = true;
            let ssh: SSH;

            ws.on('message', async (e: string): Promise<void> => {
                if (isFirst) {
                    isFirst = false;
                    const sessionData = JSON.parse(e);
                    ssh = await SSH.start(sessionData.host, sessionData.username, sessionData.password);
                    ws.send(JSON.stringify({ status: 'ok' }));
                    ssh.on('data', (data: Buffer): void => {
                        ws.send(data.toString('utf-8'));
                    });
                } else {
                    ssh.write(e);
                }
            });
        });

        console.log(`SSH Server starts at :${port}`);
    }

    static stop(): void {
        SSHServer._wss.close();
    }
}