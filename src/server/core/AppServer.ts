import * as Formidable from "express-formidable";
import * as Cors from "cors";
import * as Request from "request";
import Application from "../app/Application";
import User from "../user/User";
import AuthenticationError from "../error/AuthenticationError";
import BaseServerApi from "./BaseServerApi";
import Session from "../user/Session";
import * as Express from 'express';
import IPC from "../system/IPC";
import * as ChildProcess from "child_process";

export default class AppServer {
    private static _server: any;

    static async run(port: number): Promise<void> {
        const RestApp = Express();
        RestApp.use(Formidable());
        RestApp.use(Cors());

        const corsOptions = {
            origin: [`${process.env.DOMAIN}`, `.${process.env.DOMAIN}`],
            optionsSuccessStatus: 200
        };

        const sessionDb = await Application.getSessionDb();
        const sessionList = sessionDb.get('session').find();
        for (let i = 0; i < sessionList.length; i++) {
            Application.runningApplications.set(
                sessionList[i].key,
                new Session(sessionList[i].key, new User(sessionList[i].user), new Application(sessionList[i].application))
            );
        }

        // Rest api
        BaseServerApi.baseApiWithSessionControl(RestApp, '^/\\$api', {
            'Application': Application,
            // 'FileSystem': FileSystem,
            'User': User
        });

        // Remote
        RestApp.get('^/\\$remote/:path(*)', async (req: Express.Request, res: Express.Response) => {
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
        RestApp.post('^/\\$remote', async (req: Express.Request, res: Express.Response) => {
            try {
                Request({
                    method: 'GET',
                    url: req['fields'].url,
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

        RestApp.post('^/\\$open-native', async (req: Express.Request, res: Express.Response) => {
            const child = ChildProcess.spawn('node', ['node_modules/electron/cli.js', '.', req['fields'].url], {
                cwd: 'native',
                stdio: 'ignore',
                detached: true,
                windowsHide: true
            });
            child.unref();

            res.send({
                status: true
            });
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
        /*RestApp.get('^/fs/:path(*)', Cors(corsOptions), async (req: Express.Request, res: Express.Response) => {
            try {
                if (!req.params.path) {
                    req.params.path = '/';
                }
                req.query.appDomain = req.headers['host'];
                req.query.domain = req.headers['host'].split('.').slice(1).join('.');

                // Get application session by session key
                const subdomainKey = req.headers.host.split('.')[0];
                const accessToken = req.query.access_token || req.headers['access_token'] || subdomainKey;
                const session = Application.runningApplications.get(accessToken);
                if (!session) {
                    throw new AuthenticationError(`Session not found!`);
                }

                // Make query
                const resp = await IPC.send('fs', 'json', {
                    type: req.query.m || 'read',
                    path: req.params.path,
                    args: req.query,
                    session
                });

                if (typeof resp === "string") {
                    res.sendFile(resp);
                } else
                if (resp instanceof Buffer) {
                    res.setHeader('Content-Type', resp.subarray(0, 255).toString('utf-8').replace(/\u0000/g, ''));
                    res.send(resp.subarray(255));
                } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(resp);
                }
            } catch (e) {
                res.status(500);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    status: false,
                    message: e
                }));
            }
        });*/

        // Get file from file system api
        const readFromFileSystem = async (req: Express.Request, res: Express.Response): Promise<void> => {
            if (!req.params.path) {
                req.params.path = '/';
            }

            try {
                if (!req.headers.host) {
                    throw new Error(`Host not found!`);
                }

                // Get application session by session key
                const finalParams = Object.assign(req.query, req.body, req['fields'], req['files']);
                const subdomainKey = req.headers.host.split('.')[0];
                const accessToken = req.query.access_token || req.headers['access_token'] || subdomainKey;
                const session = Application.runningApplications.get(accessToken);

                if (!session) {
                    throw new AuthenticationError(`Session not found!`);
                }

                // Collect files
                const files = {};
                for (const file in req['files']) {
                    if (!req['files'].hasOwnProperty(file)) {
                        continue;
                    }
                    files[file] = req['files'][file].path;
                    delete finalParams[file];
                }
                finalParams.files = files;

                // Make query to FS Service
                const resp = await IPC.send('fs', 'json', {
                    type: req.query.m || 'read',
                    path: req.params.path,
                    args: finalParams,
                    session
                });

                if (typeof resp === "string") {
                    res.sendFile(resp);
                } else if (resp instanceof Buffer) {
                    res.setHeader('Content-Type', resp.subarray(0, 255).toString('utf-8').replace(/\u0000/g, ''));
                    res.send(resp.subarray(255));
                } else {
                    res.send(resp);
                }
            } catch (e) {
                res.status(e.httpStatusCode || 500);
                res.send({
                    status: false,
                    message: e
                });
            }
        };

        RestApp.get('^/:path(*)', Cors(corsOptions), readFromFileSystem);
        RestApp.post('^/:path(*)', Cors(corsOptions), readFromFileSystem);

        // Get file from file system api
        /*RestApp.get('^/:path(*)', Cors(corsOptions), async (req: Express.Request, res: Express.Response) => {
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
        });*/

        return new Promise<void>(((resolve: Function) => {
            AppServer._server = RestApp.listen(port, () => {
                console.log(`App Server starts at :${port}`);
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