import * as Formidable from "express-formidable";
import * as Cors from "cors";
import * as Request from "request";
import * as MimeTypes from 'mime-types';
import Application from "../app/Application";
import User from "../user/User";
import AuthenticationError from "../error/AuthenticationError";
import FileSystem from "../fs/FileSystem";
import BaseServerApi from "./BaseServerApi";
import Service from "../app/Service";
import Session from "../user/Session";
import * as Path from "path";

export default class AppServer {
    private static _server: any;

    static async run(port: number) {
        const Express = require('express'), RestApp = Express();
        RestApp.use(Formidable());
        RestApp.use(Cors());

        let corsOptions = {
            origin: [`${process.env.DOMAIN}`, `.${process.env.DOMAIN}`],
            optionsSuccessStatus: 200
        };

        let sessionDb = await Application.getSessionDb();
        let sessionList = sessionDb.get('session').find();
        for (let i = 0; i < sessionList.length; i++)
            Application.runningApplications.set(
                sessionList[i].key,
                new Session(sessionList[i].key, new User(sessionList[i].user), new Application(sessionList[i].application))
            );

        // Rest api
        BaseServerApi.baseApiWithSessionControl(RestApp, '^/\\$api', {
            'Application': Application,
            'FileSystem': FileSystem,
            'User': User
        });

        // Remote
        RestApp.get('^/\\$remote/:path(*)', async (req, res) => {
            try {
                Request({
                    method: 'GET',
                    url: req.params.path,
                    encoding: null
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        res.set('Content-Type', response.headers['content-type']);
                        res.set('Content-Length', response.headers['content-length']);
                        res.send(body);
                    } else {
                        res.status(404);
                        res.send({
                            status: false,
                            message: 'Not found'
                        });
                    }
                });
            } catch (e) {
                res.status(e.httpStatusCode || 500);
                res.send({
                    status: false,
                    message: e.message
                });
            }
        });
        RestApp.post('^/\\$remote', async (req, res) => {
            try {
                Request({
                    method: 'GET',
                    url: req.fields.url,
                    encoding: null
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        res.set('Content-Type', response.headers['content-type']);
                        res.set('Content-Length', response.headers['content-length']);
                        res.send(body);
                    } else {
                        res.status(404);
                        res.send({
                            status: false,
                            message: 'Not found post'
                        });
                    }
                });
            } catch (e) {
                res.status(e.httpStatusCode || 500);
                res.send({
                    status: false,
                    message: e.message
                });
            }
        });

        // Get file from file system api
        /*RestApp.get('^/\\$service/:path(*)', async (req, res) => {
            try {
                // Get user from db by session key
                let subdomainKey = req.headers.host.split('.')[0];
                let accessToken = req.query.access_token || req.headers['access_token'] || subdomainKey;
                let session = Application.runningApplications.get(accessToken);
                if (!session) throw new Error(`Session not found!`);

                /!*if (!Service.runningServices.has(session))
                    throw new Error(`Service not found!`);*!/

                let args = Object.assign({}, req.query);
                delete args.access_token;
                if (req.params.path[0] !== '/')
                    req.params.path = '/' + req.params.path;
                let response = await (Service.runningServices.get(session).execute(req.params.path, args));

                res.setHeader('Content-Type', 'application/json');
                res.send(response);
            } catch (e) {
                res.status(e.httpStatusCode || 500);
                res.send({
                    status: false,
                    message: e.message
                });
            }
        });*/

        // Get file from file system api
        RestApp.get('^/:path(*)', Cors(corsOptions), async (req, res) => {
            if (!req.params.path) {
                req.params.path = '/';
            }
            req.query.appDomain = req.headers['host'];
            req.query.domain = req.headers['host'].split('.').slice(1).join('.');

            try {
                // Get application session by session key
                const subdomainKey = req.headers.host.split('.')[0];
                const accessToken = req.query.access_token || req.headers['access_token'] || subdomainKey;
                const session = Application.runningApplications.get(accessToken);
                if (!session) {
                    throw new AuthenticationError(`Session not found!`);
                }

                // If root of application
                if (req.params.path === '/') {
                    // Try to get index.ts
                    let drive = FileSystem.getDrive(session, 'index.ts', 'r', req.query);
                    if (!await drive.exists()) {
                        // If there is no index.ts then load index.html
                        drive = FileSystem.getDrive(session, 'index.html', 'r', req.query);
                        const fileData = await drive.readFile();
                        res.setHeader('Content-Type', drive.contentType);
                        res.send(fileData);
                    } else {
                        // Inject a html for an index.ts
                        res.setHeader('Content-Type', 'text/html');
                        res.send(`<!doctype html>
                            <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
                                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                                <title>Document</title>
                            </head>
                            <body class="scroll-mini"></body>
                            <script src="index.ts?node_modules"></script>
                        </html>`);
                    }
                } else {
                    // Resolve path
                    const drive = FileSystem.getDrive(session, req.params.path, 'r', req.query);

                    // Return original or converted file
                    if (req.query.hasOwnProperty('keep-original')) {
                        res.sendFile(drive.path);
                    } else {
                        const fileData = await drive.readFile();

                        if (drive.contentType.match('image/')) {
                            res.setHeader('Cache-Control', 60);
                        }

                        res.setHeader('Content-Type', drive.contentType);
                        res.send(fileData);
                    }
                }
            } catch (e) {
                res.status(e.httpStatusCode || 500);
                res.send({
                    status: false,
                    message: e.message
                });
            }
        });

        return new Promise<void>((resolve => {
            AppServer._server = RestApp.listen(port, () => {
                console.log(`App Server starts at :${port}`);
                resolve();
            });
        }));
    }

    static stop() {
        if (this._server)
            this._server.close();
    }
}