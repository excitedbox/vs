import * as Util from 'util';
import User from "../user/User";
import Application from "../app/Application";
import Session from "../user/Session";
import BaseServerApi from "./BaseServerApi";

export default class EntryServer {
    private static _server: any;

    static async run(port: number) {
        const Express = require('express'), RestApp = Express();

        // Set public folder
        RestApp.use(Express.static('./bin/public'));

        // Auth entry point
        /*RestApp.get('^/auth', async (req, res) => {
            try {
                // Get user from db by session key
                let accessToken = req.query.access_token || req.headers['access_token'];
                if (accessToken) {
                    let user = await User.getBySession(accessToken);
                    if (user) throw new Error(`Already signed!`);
                }

                // Auth user and return access token
                let session = await User.auth(req.query.name, req.query.password);
                res.setHeader('Content-Type', 'application/json');
                res.send({ ...session });
            }
            catch (e) {
                res.status(e.httpStatusCode || 500);
                res.send({
                    status: false,
                    message: e.message
                });
            }
        });*/

        // Rest api
        /*BaseServerApi.baseApiWithSessionControl(RestApp, '^/\\$api', {
            'Application': Application
        });*/

        // Default app
        RestApp.get('^/', async (req, res) => {
            console.log(req.headers.host);
            let host = req.headers.host.split(':');
            res.redirect(`http://auth.${host[0]}:${+host[1] + 1}`);
        });

        return new Promise<void>((resolve => {
            EntryServer._server = RestApp.listen(port, () => {
                console.log(`Entry Server starts at :${port}`);
                resolve();
            });
        }));
    }

    static stop() {
        if (this._server)
            this._server.close();
    }
}