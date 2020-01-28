import Session from "../user/Session";
import * as Fs from 'fs';
import * as Util from "util";
import * as ChildProcess from "child_process";
import * as Rimraf from "rimraf";
import JsonDb from "../../lib/db/JsonDb";
import Helper from "../Helper";

const Exec = Util.promisify(ChildProcess.exec);
const ReadFile = Util.promisify(Fs.readFile);
const MkDir = Util.promisify(Fs.mkdir);
const RemoveFolder = Util.promisify(Rimraf);

/**
 * Class for work with applications.
 */
export default class Application {
    public id: number;
    public name: string;
    public path: string;

    public static readonly runningApplications: Map<string, Session> = new Map<string, Session>();

    /**
     * Create application info from data
     * @param data
     */
    constructor({ id, name, path }) {
        this.id = +id;
        this.name = name;
        this.path = path;
    }

    /**
     * Run user application by a repo url. Method creates a new session with application info.
     * @param session
     * @param repo
     */
    static async run(session: Session, repo: string): Promise<Session> {
        // Find app by repo
        let app = await this.findByRepo(session, repo);

        // Generate new session
        let newKey = Helper.randomKey;
        let newSession = new Session(newKey, session.user, app);

        // Save application session
        this.runningApplications.set(newKey, newSession);

        // Return session
        return newSession;
    }

    /**
     * Close application session by session info. Note it's not only user session but application too.
     * @param applicationSession
     */
    static close(applicationSession: Session) {
        this.runningApplications.delete(applicationSession.key);
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
        let appDb = await this.getApplicationDb(session.user.name);
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
        let appDb = await this.getApplicationDb(session.user.name);
        let app = appDb.get('application').findOne({repo});
        if (!app) throw new Error(`Application "${repo}" not found!`);

        // Remove folder
        await RemoveFolder(new Application(app).path);

        // Remove application from db
        await appDb.get('application').remove({repo}).write();
    }

    /**
     * Get list of applications from session user
     * @param session
     */
    static async list(session: Session) {
        if (!session) throw new Error(`Session is require!`);

        // Get application db and return all applications
        let appDb = await this.getApplicationDb(session.user.name);
        return appDb.get('application').find();
    }

    /**
     * Pull last commits from repo
     * @param session
     * @param repo
     */
    static async pullUpdate(session: Session, repo: string) {
        // Find app by repo
        let app = await this.findByRepo(session, repo);

        // Pull new commits
        await Exec(`cd "${new Application(app).path}" && git pull && git fetch --tags`);
    }

    /**
     * Get commit list for user' application.
     * @param session
     * @param repo
     */
    static async commitList(session: Session, repo: string) {
        // Find app by repo
        let app = await this.findByRepo(session, repo);

        // Pull new commits
        const {stdout} = await Exec(`cd "${new Application(app).path}" && git log --pretty=format:"%H|%an|%ad|%s"`);
        return stdout.split('\n').map(x => x.trim()).filter(Boolean).map(x => {
            let info = x.split('|');
            return {
                hash: info.shift(),
                author: info.shift(),
                date: new Date(info.shift()),
                comment: info.shift()
            }
        });
    }

    /**
     * Find user application by a repo url.
     * @param session
     * @param repo
     */
    static async findByRepo(session: Session, repo: string): Promise<Application> {
        if (!session) throw new Error(`Session is require!`);
        if (!repo) throw new Error(`Invalid repo url!`);

        // Get application db and find app
        let appDb = await this.getApplicationDb(session.user.name);
        let app = appDb.get('application').findOne({repo});
        if (!app) throw new Error(`Application "${repo}" not found!`);

        return new Application(app);
    }

    /**
     * Get a current commit hash of user' application by repo
     * @param session
     * @param repo
     */
    static async currentCommit(session: Session, repo: string) {
        // Find app by repo
        let app = await this.findByRepo(session, repo);

        // Get and return current commit hash
        const {stdout} = await Exec(`cd "${new Application(app).path}" && git rev-parse --verify HEAD`);
        return stdout.replace(/\n/g, '').trim();
    }

    /**
     * Get DB of applications for specific user
     * @param user
     */
    static async getApplicationDb(user: string) {
        if (!user) throw new Error(`User name required!`);
        return await JsonDb.db(`./user/${user}/application.json`, {application: []});
    }
}