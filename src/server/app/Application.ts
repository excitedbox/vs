import Session from "../user/Session";
import * as Fs from 'fs';
import * as Util from "util";
import * as ChildProcess from "child_process";
import * as Rimraf from "rimraf";
import JsonDb from "../../lib/db/JsonDb";

const Exec = Util.promisify(ChildProcess.exec);
const ReadFile = Util.promisify(Fs.readFile);
const MkDir = Util.promisify(Fs.mkdir);
const RemoveFolder = Util.promisify(Rimraf);

export default class Application {
    public id: number;
    public name: string;
    public path: string;

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.path = data.path;
    }

    static run() {

    }

    static close() {

    }

    /**
     * Install application from the repo url to user (from the session) folder
     * @param session
     * @param repo
     */
    static async install(session: Session, repo: string) {
        if (!session) throw new Error(`Session is require!`);

        // Check url is correct
        if (!repo) throw new Error(`Invalid repo url!`);
        if (!(repo.startsWith('https://') || repo.startsWith('http://'))) throw new Error(`Invalid repo url!`);

        // Get repo domain
        let domain = repo.replace(/https?:\/\//, '').split('/').shift();

        // Generate repo folder name
        let folderName = domain + '_' + repo.split('/').slice(-2).map(x => x.replace('.git', '')
            .replace('.', '_'))
            .join('_');

        // Final app path in user app folder
        let finalAppPath = session.user.appDir + '/' + folderName;

        // Check if already installed
        if (Fs.existsSync(finalAppPath)) throw new Error(`Folder already exists!`);

        // Clone and fetch repo
        try {
            await Exec(`git clone "${repo}" "${finalAppPath}"`);
            await Exec(`cd ${finalAppPath} && git fetch && git fetch --tags`);
        } catch {
            await RemoveFolder(finalAppPath);
            throw new Error(`Can't clone "${repo}"`);
        }

        // Check if there is application description
        let appJson;
        try {
            appJson = JSON.parse(await ReadFile(`${finalAppPath}/application.json`, 'utf-8'));
        } catch {
            await RemoveFolder(finalAppPath);
            throw new Error(`Application "${repo}" doesn't contain application.json file`);
        }

        // Add new app
        let appInfo = Object.assign(appJson, {
            name: folderName,
            path: finalAppPath,
            repo: repo
        });

        // Save application to db
        let appDb = await this.getApplicationDb();
        await appDb.get('application').push(appInfo).write();

        // Create data folder
        await MkDir(`${session.user.dataDir}/${folderName}`, {recursive: true});
    }

    /**
     * Remove application from user folder and application db
     * @param session
     * @param repo
     */
    static async remove(session: Session, repo: string) {
        if (!session) throw new Error(`Session is require!`);
        if (!repo) throw new Error(`Invalid repo url!`);

        // Get application db and search the app
        let appDb = await this.getApplicationDb();
        let app = appDb.get('application').findOne({repo});
        if (!app) throw new Error(`Application "${repo}" not found!`);

        // Remove folder
        await RemoveFolder(new Application(app).path);

        // Remove application from db
        await appDb.get('application').remove({repo}).write();
    }

    static pullUpdate() {

    }

    static checkUpdate() {

    }

    static list() {

    }



    static commitList() {

    }

    static currentCommit() {

    }

    static async getApplicationDb() {
        return await JsonDb.db('./user/application.json', {application: []});
    }
}