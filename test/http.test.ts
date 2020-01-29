import * as Chai from 'chai';
import User from "../src/server/user/User";
import Application from "../src/server/app/Application";
import Session from "../src/server/user/Session";
import AuthenticationError from "../src/server/error/AuthenticationError";
import AppServer from "../src/server/core/AppServer";
import OsServer from "../src/server/core/OsServer";
import Axios from 'axios';

describe('Http', function () {
    Chai.use(require('chai-as-promised'));

    // Import .env config
    require('dotenv').config();

    // Run os server
    OsServer.run(+process.env.OS_PORT + 100);

    // Run app server
    AppServer.run(+process.env.OS_PORT + 101);

    let osServer = `http://localhost:${+process.env.OS_PORT + 100}/`;
    let appServer = (key = null) => {
        if (!key) return `http://localhost:${+process.env.OS_PORT + 101}/`;
        return `http://${key}.localhost:${+process.env.OS_PORT + 101}/`
    };
    let accessToken = '';

    it('http auth', async function () {
        let {data} = await Axios.get(`${osServer}auth?name=root&password=1234`);
        accessToken = data.key;

        Axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        Axios.defaults.headers.common['access_token'] = accessToken;
    });

    it('http app run', async function () {
        this.timeout(60000);

        // Install & run
        await Axios.get(`${osServer}api?m=Application.install&repo=https://github.com/maldan/vde-image-lab.git`);
        let appKey = (await Axios.get(`${osServer}api?m=Application.run&repo=https://github.com/maldan/vde-image-lab.git`)).data.key;

        // Get main app page
        await Axios.get(`${appServer()}index.html?access_token=${appKey}`);
        // await Axios.get(`${appServer()}index.html`);
        await Axios.get(`${appServer()}$lib/db/JsonDb.ts?convert=true&access_token=${appKey}`);

        // Close and remove
        await Axios.get(`${osServer}api?m=Application.close&key=${appKey}`);
        await Axios.get(`${osServer}api?m=Application.remove&repo=https://github.com/maldan/vde-image-lab.git`);
    });
});
