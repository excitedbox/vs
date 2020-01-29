import Application from "../app/Application";
import User from "../user/User";
import AuthenticationError from "../error/AuthenticationError";
import FileSystem from "../fs/FileSystem";

export default class AppServer {
    static run(port: number) {
        const Express = require('express'), RestApp = Express();

        // Api classes
        const Classes = {
            'Application': Application
        };

        // Get file from file system api
        RestApp.get('^/:path(*)', async (req, res) => {
            try {
                // Get application session by session key
                let subdomainKey = req.headers.host.split('.')[0];
                let accessToken = req.query.access_token || req.headers['access_token'] || subdomainKey;
                let session = Application.runningApplications.get(accessToken);
                if (!session) throw new AuthenticationError(`Session not found!`);

                // Resolve path
                let file = await FileSystem.resolvePath(session, req.params.path);

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

        RestApp.listen(port, function () {
            console.log(`App Server starts at :${port}`);
        });
    }
}