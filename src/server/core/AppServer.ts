import * as Util from 'util';
import Application from "../app/Application";
import User from "../user/User";
import AuthenticationError from "../error/AuthenticationError";
import FileSystem from "../fs/FileSystem";
import FileConverter from "../fs/FileConverter";
import BaseServerApi from "./BaseServerApi";

export default class AppServer {
    static async run(port: number) {
        const Express = require('express'), RestApp = Express();

        // Rest api
        BaseServerApi.baseApiWithSessionControl(RestApp, '^/\\$api', {
            'FileSystem': FileSystem
        }, 'application');

        // Get file from file system api
        RestApp.get('^/:path(*)', async (req, res) => {
            try {
                // Get application session by session key
                let subdomainKey = req.headers.host.split('.')[0];
                let accessToken = req.query.access_token || req.headers['access_token'] || subdomainKey;
                let session = Application.runningApplications.get(accessToken);
                if (!session) throw new AuthenticationError(`Session not found!`);

                // Resolve path
                let file = await FileSystem.resolvePath(session, req.params.path, true, 'r');

                // If convert enabled
                if (req.query.convert) {
                    let convertedFile = await FileConverter.convert(file, req.query);

                    // If converted
                    if (convertedFile) {
                        res.setHeader('Content-Type', convertedFile.type);
                        res.send(convertedFile.output);
                        return;
                    }
                }

                // Send file
                res.sendFile(file);
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
                console.log(`App Server starts at :${port}`);
                resolve();
            });
        }));

        //await Listen(RestApp.listen(port));
        //console.log(`App Server starts at :${port}`);
    }
}