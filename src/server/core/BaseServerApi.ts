import Application from "../app/Application";
import FunctionHelper from "../../lib/helper/FunctionHelper";

export default class BaseServerApi {
    private static async requestLogic(classList: any, req, res) {
        try {
            const finalParams = Object.assign(req.query, req.body, req.fields, req.files);

            // Get user from db by session key
            const subdomainKey = req.headers.host.split('.')[0];
            const accessToken = finalParams.access_token || req.headers['access_token'] || subdomainKey;
            const session = Application.runningApplications.get(accessToken);
            /*if (serverType === 'application')
            else session = new Session(accessToken, await User.getBySession(accessToken));*/
            if (!session) {
                throw new Error(`Session not found!`);
            }

            if (!finalParams.m) {
                throw new Error(`Parameter "m" is required!`);
            }

            // Parse method name & params
            const methodInfo = finalParams.m.split('.');
            const className = methodInfo[0], method = methodInfo[1];
            if (!classList[className]) {
                throw new Error(`Class "${className}" not found!`);
            }
            if (!classList[className][method]) {
                throw new Error(`Method "${method}" not found!`);
            }

            // Build params
            const argParams = Object.assign({}, finalParams);
            delete argParams.access_token;
            delete argParams.session;
            argParams.session = session;
            argParams.args = finalParams;

            // Check response type
            let responseType = classList[className].methodResponseType[method];
            if (!responseType) {
                throw new Error(`Method "${method}" forbidden to call!`);
            }
            if (typeof responseType !== 'string') {
                throw new Error(`You are trying something bad with "${method}" method!`);
            }

            // Call function
            let response = await FunctionHelper.callFunctionWithArgumentNames(classList[className][method], argParams);

            // Session response, remove critical information
            if (responseType === 'session') {
                response = Object.assign({}, response);
                responseType = 'json';
            }

            if (responseType === 'binary') {
                res.setHeader('Content-Type', 'application/octet-stream');
                res.send(response);
                return;
            }

            // Json and other response types
            if (responseType === 'json') {
                if (!response) {
                    response = {};
                }
                if (typeof response !== "object") {
                    throw new Error(`Method "${method}" must return object!`);
                }
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