import * as Formidable from "express-formidable";
import * as Cors from "cors";
import Application from "../app/Application";
import User from "../user/User";
import AuthenticationError from "../error/AuthenticationError";
import FileSystem from "../fs/FileSystem";
import BaseServerApi from "./BaseServerApi";
import Service from "../app/Service";

export default class AppServer {
    private static _server:any;

    static async run(port: number) {
        const Express = require('express'), RestApp = Express();
        RestApp.use(Formidable());
        RestApp.use(Cors());

        let corsOptions = {
            origin: ['localhost', '.localhost'],
            optionsSuccessStatus: 200
        };

        // Rest api
        BaseServerApi.baseApiWithSessionControl(RestApp, '^/\\$api', {
            'Application': Application,
            'FileSystem': FileSystem,
            'User': User
        }, 'application');

        // Get file from file system api
        RestApp.get('^/\\$service/:path(*)', async (req, res) => {
            try {
                // Get user from db by session key
                let subdomainKey = req.headers.host.split('.')[0];
                let accessToken = req.query.access_token || req.headers['access_token'] || subdomainKey;
                let session = Application.runningApplications.get(accessToken);
                if (!session) throw new Error(`Session not found!`);

                if (!Service.runningServices.has(session))
                    throw new Error(`Service not found!`);

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
        });

        // Get file from file system api
        RestApp.get('^/:path(*)', Cors(corsOptions), async (req, res) => {
            if (!req.params.path) req.params.path = 'index.html';

            try {
                // Get application session by session key
                let subdomainKey = req.headers.host.split('.')[0];
                let accessToken = req.query.access_token || req.headers['access_token'] || subdomainKey;
                let session = Application.runningApplications.get(accessToken);
                if (!session) throw new AuthenticationError(`Session not found!`);

                // Resolve path
                let drive = FileSystem.getDrive(session, req.params.path, 'r', req.query);
                let fileData = await drive.readFile();
                res.setHeader('Content-Type', drive.contentType);
                res.send(fileData);
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