import * as Util from 'util';
import User from "../user/User";
import Application from "../app/Application";
import Helper from "../system/Helper";
import Session from "../user/Session";
import BaseServerApi from "./BaseServerApi";

export default class OsServer {
    private static _server:any;

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
        BaseServerApi.baseApiWithSessionControl(RestApp, '^/\\$api', {
            'Application': Application
        });

        // Default app
        RestApp.get('^/', async (req, res) => {
            res.redirect(`http://auth.${process.env.DOMAIN}:${+process.env.OS_PORT + 1}`);
        });

        return new Promise<void>((resolve => {
            OsServer._server = RestApp.listen(port, () => {
                console.log(`OS Server starts at :${port}`);
                resolve();
            });
        }));
    }

    static stop() {
        if (this._server)
            this._server.close();
    }
}