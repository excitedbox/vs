import User from "../user/User";
import Session from "../user/Session";
import Helper from "../system/Helper";
import Application from "../app/Application";

export default class BaseServerApi {
    private static async requestLogic(classList: any, req, res) {
        try {
            let finalParams = Object.assign(req.query, req.body, req.files);

            // Get user from db by session key
            let subdomainKey = req.headers.host.split('.')[0];
            let accessToken = finalParams.access_token || req.headers['access_token'] || subdomainKey;
            let session = Application.runningApplications.get(accessToken);
            /*if (serverType === 'application')
            else session = new Session(accessToken, await User.getBySession(accessToken));*/
            if (!session) throw new Error(`Session not found!`);

            if (!finalParams.m) throw new Error(`Parameter "m" is required!`);

            // Parse method name & params
            let methodInfo = finalParams.m.split('.');
            let className = methodInfo[0], method = methodInfo[1];
            if (!classList[className]) throw new Error(`Class "${className}" not found!`);
            if (!classList[className][method]) throw new Error(`Method "${method}" not found!`);

            // Build params
            let argParams = Object.assign({}, finalParams);
            delete argParams.access_token;
            delete argParams.session;
            argParams.session = session;

            // Check response type
            let responseType = classList[className].methodResponseType[method];
            if (!responseType) throw new Error(`Method "${method}" forbidden to call!`);
            if (typeof responseType !== 'string') throw new Error(`You are trying something bad with "${method}" method!`);

            // Call function
            let response = await Helper.callFunctionWithArgumentNames(classList[className][method], argParams);

            // Session response, remove critical information
            if (responseType === 'session') {
                response = Object.assign({}, response);
                // delete response.user;
                // delete response.application;
                responseType = 'json';
            }

            if (responseType === 'binary') {
                res.setHeader('Content-Type', 'application/octet-stream');
                res.send(response);
                return;
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
        } catch (e) {
            res.status(e.httpStatusCode || 500);
            res.send({
                status: false,
                message: e.message
            });
        }
    }

    static baseApiWithSessionControl(restApp, path: string, classList: any) {
        // Rest api
        restApp.get(path, async (req, res) => {
            return await BaseServerApi.requestLogic(classList, req, res);
        });

        // Rest api
        restApp.post(path, async (req, res) => {
            return await BaseServerApi.requestLogic(classList, req, res);
        });
    }
}