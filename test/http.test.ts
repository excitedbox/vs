import * as Chai from 'chai';
import User from "../src/server/user/User";
import Application from "../src/server/app/Application";
import Session from "../src/server/user/Session";
import AuthenticationError from "../src/server/error/AuthenticationError";
import AppServer from "../src/server/core/AppServer";
import OsServer from "../src/server/core/OsServer";
import Axios from 'axios';
import FileSystem from "../src/server/fs/FileSystem";
import Main from '../src/server/Main'

describe('Http', function () {
    Chai.use(require('chai-as-promised'));

    // Import .env config
    require('dotenv').config();

    let osServer = `http://localhost:${+process.env.OS_PORT + 100}/`;
    let appServer = (key = null) => {
        if (!key) return `http://localhost:${+process.env.OS_PORT + 101}/`;
        return `http://${key}.localhost:${+process.env.OS_PORT + 101}/`
    };
    let accessToken = '';
    let appAccessToken = '';

    it('server start', async function () {
        // Run os server
        await Main.run(true);
    });

    it('http auth', async function () {
        let {data} = await Axios.get(`${osServer}auth?name=test&password=test123`);
        accessToken = data.key;

        Axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        Axios.defaults.headers.common['access_token'] = accessToken;
    });

    it('http app run', async function () {
        this.timeout(60000);

        // Install & run
        await Axios.get(`${osServer}api?m=Application.silentInstall&repo=http://maldan.ru:3569/root/test-app.git`);
        appAccessToken = (await Axios.get(`${osServer}api?m=Application.run&query=http://maldan.ru:3569/root/test-app.git`)).data.key;

        // Get main app page
        await Axios.get(`${appServer()}index.html?access_token=${appAccessToken}`);
        await Axios.get(`${appServer()}test.ts?convert=true&access_token=${appAccessToken}`);
        await Axios.get(`${appServer()}style.scss?convert=true&access_token=${appAccessToken}`);
        await Axios.get(`${appServer()}$lib/db/JsonDb.ts?convert=true&access_token=${appAccessToken}`);

        // Close and remove
        await Axios.get(`${osServer}api?m=Application.close&key=${appAccessToken}`);
        await Axios.get(`${osServer}api?m=Application.remove&query=http://maldan.ru:3569/root/test-app.git`);
    });

    it('app fs test', async function () {
        this.timeout(60000);

        // Install & run
        await Axios.get(`${osServer}api?m=Application.silentInstall&repo=http://maldan.ru:3569/root/test-app.git`);
        appAccessToken = (await Axios.get(`${osServer}api?m=Application.run&query=http://maldan.ru:3569/root/test-app.git`)).data.key;

        // Check is exists
        Chai.expect((await Axios.get(`${appServer()}$api?m=FileSystem.exists&path=/index.html&access_token=${appAccessToken}`)).data.status).eq(true);
        Chai.expect((await Axios.get(`${appServer()}$api?m=FileSystem.exists&path=/ff sd f.html&access_token=${appAccessToken}`)).data.status).eq(false);

        // Check convert
        await Axios.get(`${appServer()}index.html?access_token=${appAccessToken}`);
        await Axios.get(`${appServer()}style.scss?convert=true&access_token=${appAccessToken}`);
        await Axios.get(`${appServer()}$lib/db/JsonDb.ts?convert=true&access_token=${appAccessToken}`);

        // Close and remove
        //await Axios.get(`${osServer}api?m=Application.close&key=${appKey}`);
        //await Axios.get(`${osServer}api?m=Application.remove&repo=http://maldan.ru:3569/root/test-app.git`);
    });

    it('logs test', async function () {
        // Check is exists
        Chai.expect((await Axios.get(`${appServer()}$logs?access_token=${appAccessToken}`)).data).to.be.an('array');
    });

    it('service test', async function () {
        // Check is exists
        Chai.expect((await Axios.get(`${appServer()}$service/add?a=1&b=2&access_token=${appAccessToken}`)).data.value).to.be.eq(3);
    });

    it('end', async function () {
        Main.stop();
    });
});
