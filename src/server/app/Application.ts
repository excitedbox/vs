import Session from "../user/Session";
import * as Fs from 'fs';
import * as Util from "util";
import * as ChildProcess from "child_process";
import * as Rimraf from "rimraf";
import JsonDb from "../../lib/db/JsonDb";
import Service from "./Service";
import SystemJournal from "../system/SystemJournal";
import StringHelper from "../../lib/helper/StringHelper";

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
    public domain: string;
    public isStatic: boolean;
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
        'find': 'json',
        'currentCommit': 'json',
        'updatePrivileges': 'json'
    };

    /**
     * Create application info from data
     * @param data
     */
    constructor({id, name, path, isStatic, domain, storage, repo, access = []}) {
        this.id = +id;
        this.name = name;
        this.path = path;
        this.domain = domain;
        this.isStatic = isStatic;
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
        if (this.access.includes('*')) return true;
        return this.access.includes(access);
    }

    /**
     * Run user application by a repo url. Method creates a new session with application info.
     * @param session
     * @param query
     */
    static async run(session: Session, query: string): Promise<Session> {
        // Find app by repo
        let app = await Application.find(session, query);

        // Check access to run application
        if (session.isApplicationLevel && !session.checkAccess('run-application'))
            throw new Error(`Application "${app.name}" doesn't have access to run another application!`);

        // Application with lower rights can't run application with higher.
        if (session.isApplicationLevel)
            for (let i = 0; i < app.access.length; i++)
                if (!session.application.hasAccess(app.access[i]))
                    throw new Error(`Application "${session.application.name}" can't run another application "${app.name}"`);

        // Check if static
        if (app.isStatic && session.user.name !== 'root')
            throw new Error(`Only root can run static application!`);

        // Check if already run
        if (Application.runningApplications.has(app.domain))
            throw new Error(`Static application "${app.domain}.${app.name}" already running!`);

        // Generate new session
        const newKey = app.isStatic ? app.domain : StringHelper.generateRandomKey();
        const newSession = new Session(newKey, session.user, app);

        // Save application session
        Application.runningApplications.set(newKey, newSession);

        // Start service if exists
        await Service.start(newSession);

        // Save current logs
        await SystemJournal.flushLogs();

        // Save session to session list
        if (!app.isStatic) {
            let sessionDb = await Application.getSessionDb();
            await sessionDb.get('session').push(newSession).write();
        }

        // Return session
        return newSession;
    }

    /**
     * Close application session by session key info.
     * @param session
     * @param key
     */
    static async close(session: Session, key: string) {
        // Stop service if exists
        Service.stop(Application.runningApplications.get(key));

        // Remove app from list
        Application.runningApplications.delete(key);

        // Remove session from session list
        let sessionDb = await Application.getSessionDb();
        await sessionDb.get('session').remove({key}).write();
    }

    /**
     * Install application but if there is error it won't rise exception
     * @param session
     * @param repo
     */
    static async silentInstall(session: Session, repo: string): Promise<any> {
        try {
            await Application.install(session, repo);
        } catch {
            return {status: false};
        }
        return {status: true};
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
            //console.log(`git clone "${repo}"`);
            await Exec(`git clone "${repo}" "${finalAppPath}"`);
            //console.log(`git fetch`);
            await Exec(`cd ${finalAppPath} && git fetch && git fetch --tags`);
        } catch {
            await RemoveFolder(finalAppPath);
            throw new Error(`Can't clone "${repo}"`);
        }

        // Check if there is application description
        let appJson;
        try {
            appJson = JSON.parse(await ReadFile(`${finalAppPath}/application.json`, 'utf-8'));
            if (appJson.isStatic) {
                if (session.user.name !== 'root') throw new Error(`Only root can install static application!`);
                if (appJson.domain !== "") {
                    if (!(appJson.domain.match(/^[0-9a-z_\-]+$/g) && appJson.domain.length < 24))
                        throw new Error(`Incorrect domain name!`);
                }
            }
        } catch {
            await RemoveFolder(finalAppPath);
            throw new Error(`Application "${repo}" doesn't contain application.json file`);
        }

        // Add new app
        let appInfo = Object.assign(appJson, {
            name: folderName,
            path: finalAppPath,
            storage: `./user/${session.user.name}/data/${folderName}`,
            repo: repo,
            access: []
        });

        // Save application to db
        let appDb = await Application.getApplicationDb(session.user.name);
        await appDb.get('application').push(appInfo).write();
        //console.log('application saved to db');

        // Create data folder
        await MkDir(`${session.user.dataDir}/${folderName}`, {recursive: true});
        //console.log('data folder created');
    }

    /**
     * Remove application but if there is error it won't rise exception
     * @param session
     * @param query
     */
    static async silentRemove(session: Session, query: string): Promise<any> {
        try {
            await Application.remove(session, query);
        } catch {
            return {status: false};
        }
        return {status: true};
    }

    /**
     * Remove application from user folder and application db
     * @param session
     * @param query
     */
    static async remove(session: Session, query: string) {
        if (query.trim().length < 2) {
            throw new Error(`Query is too short!`);
        }

        // Find application by query
        const appDb = await Application.getApplicationDb(session.user.name);
        const app = await Application.find(session, query);

        // Remove folder
        await RemoveFolder(new Application(app).path);

        // Remove application from db
        await appDb.get('application').remove({
            id: app.id
        }).write();
    }

    /**
     * Get list of applications from session user
     * @param session
     */
    static async list(session: Session): Promise<Array<any>> {
        if (!session) {
            throw new Error(`Session is require!`);
        }

        // Get application db and return all applications
        const appDb = await Application.getApplicationDb(session.user.name);
        return appDb.get('application').find();
    }

    /**
     * Pull last commits from repo
     * @param session
     * @param query
     */
    static async pullUpdate(session: Session, query: string) {
        // Find app by repo
        let app = await Application.find(session, query);

        // Pull new commits
        await Exec(`cd "${new Application(app).path}" && git pull && git fetch --tags`);
    }

    /**
     * Get commit list for user' application.
     * @param session
     * @param query
     */
    static async commitList(session: Session, query: string) {
        // Find app by repo
        let app = await Application.find(session, query);

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
     * Find user application by a query.
     * @param session
     * @param query
     */
    static async find(session: Session, query: string): Promise<Application> {
        if (!session) throw new Error(`Session is require!`);
        if (!query) throw new Error(`Invalid query!`);

        // Get application db and find app
        let appDb = await Application.getApplicationDb(session.user.name);
        let app = appDb.get('application').findOne([
            {repo: new RegExp(query, 'i')},
            {name: new RegExp(query, 'i')},
            {title: new RegExp(query, 'i')}
        ]);
        if (!app) throw new Error(`Application "${query}" not found!`);

        return new Application(app);
    }

    /**
     * Get a current commit hash of user' application by repo
     * @param session
     * @param query
     */
    static async currentCommit(session: Session, query: string) {
        // Find app by repo
        let app = await Application.find(session, query);

        // Get and return current commit hash
        const {stdout} = await Exec(`cd "${new Application(app).path}" && git rev-parse --verify HEAD`);
        return {
            hash: stdout.replace(/\n/g, '').trim()
        };
    }

    /**
     * Update privileges for application.
     * @param session
     * @param query
     * @param access
     */
    static async updatePrivileges(session: Session, query: string, access: Array<string>) {
        // Check access to run application
        if (session.isApplicationLevel && !session.checkAccess('set-access'))
            throw new Error(`Application doesn't allow setting access to other applications`);

        // Find app by repo
        let app = await Application.find(session, query);

        // Set new access
        app.access = access.filter(x => [
            '*', 'root', 'root-readonly', 'data',
            'user', 'user-readonly', 'run-application',
            'set-access'
        ].includes(x));

        // Update db
        let appDb = await Application.getApplicationDb(session.user.name);
        await appDb.get('application').update({access: app.access}, {repo: app.repo}).write();
        //console.log(`set privileges "${access}" for app ${app.repo}`);
    }

    /**
     * Get DB of applications for specific user
     * @param user
     */
    static async getApplicationDb(user: string) {
        if (!user) throw new Error(`User name required!`);
        return await JsonDb.db(`./user/${user}/application.json`, {application: []});
    }

    /**
     * Get DB of sessions for specific user
     */
    static async getSessionDb() {
        return await JsonDb.db(`./user/session.json`, {session: []});
    }
}