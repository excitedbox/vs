import * as Express from 'express';

export default class EntryServer {
    private static _server: any;

    static async run(port: number): Promise<void> {
        const RestApp = Express();

        // Set public folder
        RestApp.use(Express.static('./bin/public'));

        // Default auth
        RestApp.get('^/', (req: Express.Request, res: Express.Response) => {
            console.log(req.headers.host);
            const host = req.headers.host.split(':');
            res.redirect(`http://auth.${host[0]}:${+host[1] + 1}`);
        });

        return new Promise<void>(((resolve: Function) => {
            EntryServer._server = RestApp.listen(port, () => {
                console.log(`Entry Server starts at :${port}`);
                resolve();
            });
        }));
    }

    static stop(): void {
        if (this._server) {
            this._server.close();
        }
    }
}