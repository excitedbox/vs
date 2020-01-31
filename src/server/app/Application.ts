import Session from "../user/Session";
import * as Fs from 'fs';
import * as Util from "util";
import * as ChildProcess from "child_process";
import * as Rimraf from "rimraf";
import JsonDb from "../../lib/db/JsonDb";
import Helper from "../system/Helper";
import Service from "./Service";
import SystemJournal from "../system/SystemJournal";

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
    public repo: string;
    public path: string;
    public storage: string;
    public access: Array<string>;

    /**
     * Current running applications for all users.
     */
    public static readonly runningApplications: Map<string, Session> = new Map<string, Session>();

    /**
     * Response types for http server for each method. Method forbidden to call if it's not listed here.
     */
    public static readonly methodResponseType: any = {
        'run': 'session',
        'close': 'json',
        'silentInstall': 'json',
        'install': 'json',
        'remove': 'json',
        'removeSilent': 'json',
        'list': 'json',
        'pullUpdate': 'json',
        'commitList': 'json',
        'findByRepo': 'json',
        'currentCommit': 'json',
    };

    /**
     * Create application info from data
     * @param data
     */
    constructor({id, name, path, storage, repo, access = []}) {
        this.id = +id;
        this.name = name;
        this.path = path;
        this.storage = storage;
        this.repo = repo;
        this.access = access;
    }

    /**
     * Check if the application have specific access.
     * @param access
     */
    hasAccess(access: string) {
        if (!Array.isArray(this.access)) return false;
        return this.access.includes(access);
    }

    /**
     * Run user application by a repo url. Method creates a new session with application info.
     * @param session
     * @param repo
     */
    static async run(session: Session, repo: string): Promise<Session> {
        // Find app by repo
        let app = await Application.findByRepo(session, repo);

        // Generate new session
        let newKey = Helper.randomKey;
        let newSession = new Session(newKey, session.user, app);

        // Save application session
        Application.runningApplications.set(newKey, newSession);

        // Start service if exists
        await Service.start(newSession);

        // Save current logs
        await SystemJournal.flushLogs();

        // Return session
        return newSession;
    }

    /**
     * Close application session by session key info.
     * @param session
     * @param key
     */
    static close(session: Session, key: string) {
        // Stop service if exists
        Service.stop(Application.runningApplications.get(key));

        // Remove app from list
        Application.runningApplications.delete(key);
    }

    /**
     * Install application but if there is error it won't rise exception
     * @param session
     * @param repo
     */
    static async silentInstall(session: Session, repo: string):Promise<any> {
        try {
            await Application.install(session, repo);
        }
        catch {
            return { status: false };
        }
        return { status: true };
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
        let domain = repo.replace(/https?:\/\//, '')
            .split('/')
            .shift()
            .replace(':', '-');

        // Generate repo folder name
        let folderName = domain + '/' + repo.split('/')
            .slice(-2)
            .map(x => x.replace('.git', '')
            .replace('.', '_'))
            .join('/');

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
            storage: `./user/${session.user.name}/data/${folderName}`,
            repo: repo
        });

        // Save application to db
        let appDb = await Application.getApplicationDb(session.user.name);
        await appDb.get('application').push(appInfo).write();

        // Create data folder
        await MkDir(`${session.user.dataDir}/${folderName}`, {recursive: true});
    }

    /**
     * Remove application but if there is error it won't rise exception
     * @param session
     * @param repo
     */
    static async silentRemove(session: Session, repo: string):Promise<any> {
        try {
            await Application.remove(session, repo);
        }
        catch {
            return { status: false };
        }
        return { status: true };
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
        let appDb = await Application.getApplicationDb(session.user.name);
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
    static async list(session: Session): Promise<Array<any>> {
        if (!session) throw new Error(`Session is require!`);

        // Get application db and return all applications
        let appDb = await Application.getApplicationDb(session.user.name);
        return appDb.get('application').find();
    }

    /**
     * Pull last commits from repo
     * @param session
     * @param repo
     */
    static async pullUpdate(session: Session, repo: string) {
        // Find app by repo
        let app = await Application.findByRepo(session, repo);

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
        let app = await Application.findByRepo(session, repo);

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
        let appDb = await Application.getApplicationDb(session.user.name);
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
        let app = await Application.findByRepo(session, repo);

        // Get and return current commit hash
        const {stdout} = await Exec(`cd "${new Application(app).path}" && git rev-parse --verify HEAD`);
        return {
            hash: stdout.replace(/\n/g, '').trim()
        };
    }

    /**
     * Update privileges for application.
     * @param session
     * @param repo
     * @param access
     */
    static async updatePrivileges(session: Session, repo: string, access:string) {
        // Find app by repo
        let app = await Application.findByRepo(session, repo);

        // Set new access
        app.access = access.split(',');

        // Update db
        let appDb = await Application.getApplicationDb(session.user.name);
        await appDb.get('application').update({ access: app.access }, { repo: app.repo }).write();
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