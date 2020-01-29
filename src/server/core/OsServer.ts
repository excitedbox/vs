import * as Util from 'util';
import User from "../user/User";
import Application from "../app/Application";
import Helper from "./Helper";
import Session from "../user/Session";

export default class OsServer {
    static async run(port: number) {
        const Express = require('express'), RestApp = Express();
        // const Listen = Util.promisify(RestApp.listen);

        // Api classes
        const Classes = {
            'Application': Application
        };

        // Set public folder
        RestApp.use(Express.static('./bin/public'));

        // Auth entry point
        RestApp.get('^/auth', async (req, res) => {
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
                res.send({ key: session.key });
            }
            catch (e) {
                res.status(e.httpStatusCode || 500);
                res.send({
                    status: false,
                    message: e.message
                });
            }
        });

        // Rest api
        RestApp.get('^/api', async (req, res) => {
            try {
                // Get user from db by session key
                let accessToken = req.query.access_token || req.headers['access_token'];
                let user = await User.getBySession(accessToken);

                // Parse method name & params
                let methodInfo = req.query.m.split('.');
                let className = methodInfo[0], method = methodInfo[1];
                if (!Classes[className]) throw new Error(`Class "${className}" not found!`);
                if (!Classes[className][method]) throw new Error(`Method "${method}" not found!`);

                // Build params
                let argParams = Object.assign({}, req.query);
                delete argParams.access_token;
                delete argParams.session;
                argParams.session = new Session(accessToken, user);

                // Check response type
                let responseType = Classes[className].methodResponseType[method];
                if (!responseType) throw new Error(`Method "${method}" forbidden to call!`);
                if (typeof responseType !== 'string') throw new Error(`You are trying something bad with "${method}" method!`);

                // Call function
                let response = await Helper.callFunctionWithArgumentNames(Classes[className][method], argParams);

                // Session response, remove critical information
                if (responseType === 'session') {
                    response = Object.assign({}, response);
                    delete response.user;
                    delete response.application;
                    responseType = 'json';
                }

                // Json and other response types
                if (responseType === 'json') {
                    if (!response) response = {};
                    if (typeof response !== "object") throw new Error(`Method "${method}" must return object!`);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(response);
                } else if (responseType === 'text') {
                    res.setHeader('Content-Type', 'text/plain');
                    res.send(response);
                } else {
                    res.send('');
                }
            }
            catch (e) {
                res.status(e.httpStatusCode || 500);
                res.send({
                    status: false,
                    message: e.message
                });
            }
        });

        return new Promise<void>((resolve => {
            RestApp.listen(port, () => {
                console.log(`OS Server starts at :${port}`);
                resolve();
            });
        }));
        // await Listen(port);
        /*console.log(`OS Server starts at :${port}`);
        RestApp.listen(port);*/
    }
}