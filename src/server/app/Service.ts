import TypeServiceInfo from "../../type/TypeServiceInfo";
import Session from "../user/Session";
import * as Fs from "fs";
import * as Util from "util";
import * as ChildProcess from "child_process";
import * as Rimraf from "rimraf";
import JsonDb from "../../lib/db/JsonDb";

const Exec = Util.promisify(ChildProcess.exec);
const ReadFile = Util.promisify(Fs.readFile);
const WriteFile = Util.promisify(Fs.writeFile);
const Unlink = Util.promisify(Fs.unlink);
const MkDir = Util.promisify(Fs.mkdir);
const RemoveFolder = Util.promisify(Rimraf);

export default class Service {
    public id: number;
    public name: string;
    public repo: string;
    public path: string;

    constructor({id, name, path, repo}: TypeServiceInfo) {
        this.id = +id;
        this.name = name;
        this.path = path;
        this.repo = repo;
    }

    static async install(session: Session, repo: string): Promise<void> {
        if (!session) {
            throw new Error(`Session is require!`);
        }

        // Check url is correct
        if (!repo) {
            throw new Error(`Invalid repo url!`);
        }
        if (!(repo.startsWith('https://') || repo.startsWith('http://'))) {
            throw new Error(`Invalid repo url!`);
        }

        // Get repo domain
        const domain = repo.replace(/https?:\/\//, '')
            .split('/')
            .shift()
            .replace(':', '-');

        // Generate repo folder name
        const folderName = domain + '/' + repo.split('/')
            .slice(-2)
            .map((x: string) => x.replace('.git', '')
                .replace('.', '_'))
            .join('/');

        // Final app path in user app folder
        const finalServicePath = './service/' + folderName;

        // Check if already installed
        if (Fs.existsSync(finalServicePath)) {
            throw new Error(`Folder already exists!`);
        }

        // Clone and fetch repo
        try {
            await Exec(`git clone "${repo}" "${finalServicePath}"`);
            await Exec(`cd ${finalServicePath} && git fetch && git fetch --tags`);
        } catch {
            await RemoveFolder(finalServicePath);
            throw new Error(`Can't clone "${repo}"`);
        }

        // Check if there is application description
        let serviceJson;
        try {
            serviceJson = JSON.parse(await ReadFile(`${finalServicePath}/application.json`, 'utf-8'));
        } catch {
            await RemoveFolder(finalServicePath);
            throw new Error(`Service "${repo}" doesn't contain application.json file`);
        }

        if (serviceJson.type !== "service") {
            throw new Error('Not a service!');
        }

        // Add new app
        const serviceInfo = Object.assign(serviceJson, {
            path: finalServicePath,
            repo: repo
        });

        // Save application to db
        const appDb = await Service.getServiceDb();
        await appDb.get('service').push(serviceInfo).write();
    }

    static async silentInstall(session: Session, repo: string): Promise<{ status: boolean }> {
        try {
            await Service.install(session, repo);
        } catch {
            return {status: false};
        }
        return {status: true};
    }

    static async list(): Promise<TypeServiceInfo[]> {
        const serviceDb = await Service.getServiceDb();
        return serviceDb.get('service').find();
    }

    static async getServiceDb(): Promise<JsonDb> {
        return await JsonDb.db(`./user/service.json`, {service: []});
    }
}