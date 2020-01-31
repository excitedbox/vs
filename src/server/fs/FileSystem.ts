import * as Fs from 'fs';
import * as Util from 'util';
import * as Path from 'path';
import Session from "../user/Session";
import * as Rimraf from "rimraf";
import StdDrive from "./drive/StdDrive";
import IDrive from "./drive/IDrive";
import LibDrive from "./drive/LibDrive";

const ReadFile = Util.promisify(Fs.readFile);
const WriteFile = Util.promisify(Fs.writeFile);
const ReadDir = Util.promisify(Fs.readdir);
const RenamePath = Util.promisify(Fs.rename);
const StatFile = Util.promisify(Fs.stat);
const Exists = Util.promisify(Fs.exists);
const MkDir = Util.promisify(Fs.mkdir);
const RemoveFolder = Util.promisify(Rimraf);

export default class FileSystem {
    /**
     * Response types for http server for each method. Method forbidden to call if it's not listed here.
     */
    public static readonly methodResponseType: any = {
        'info': 'json',
        'list': 'json',
        'createDir': 'json',
        'rename': 'json',
        'remove': 'json',
        'exists': 'json',
        'writeFile': 'json',
    };

    static async info(session: Session, path: string) {
        /*let finalPath = await FileSystem.resolvePath(session, path, true, 'r');
        return await StatFile(finalPath);*/
        return await FileSystem.getDrive(session, path, 'r').info();
    }

    static async readFile(session: Session, path: string) {
        return await FileSystem.getDrive(session, path, 'r').readFile();

        //let finalPath = await FileSystem.resolvePath(session, path, true, 'r');
        //return await ReadFile(finalPath);
    }

    static async list(session: Session, path: string, filter: string = '') {
        return await FileSystem.getDrive(session, path, 'r').list(filter);

        /*let finalPath = await FileSystem.resolvePath(session, path, true, 'r');
        let list: any = await ReadDir(finalPath);

        // Transform data
        list = list.map(x => {
            const stat = Fs.lstatSync(finalPath + '/' + x);
            return {
                name: x,
                isDir: stat.isDirectory(),
                size: Fs.statSync(finalPath + '/' + x)['size'],
                created: Fs.statSync(finalPath + '/' + x)['birthtime'],
            }
        });

        // Filter files
        list = list.filter(x => {
            if (x.isDir) return true;
            return x.name.match(new RegExp(filter));
        });

        return list;*/
    }

    static async search(session: Session, path: string, filter: string = '') {
        return await FileSystem.getDrive(session, path, 'r').search(filter);
    }

    static async tree(session: Session, path: string, filter: string = '') {
        return await FileSystem.getDrive(session, path, 'r').tree(filter);
    }

    static async exists(session: Session, path: string): Promise<any> {
        /*let finalPath = await FileSystem.resolvePath(session, path, false, 'r');
        return {status: await Exists(finalPath)};*/
        return {status: await FileSystem.getDrive(session, path, 'r').exists()};
    }

    static async createDir(session: Session, path: string) {
        /*let finalPath = await FileSystem.resolvePath(session, path, false);
        await MkDir(finalPath, {recursive: true});
        if (!await this.exists(session, finalPath)) throw new Error(`Can't create the directory "${finalPath}"`);*/
        return await FileSystem.getDrive(session, path, 'w').createDir();
    }

    static async writeFile(session: Session, path: string, data: Buffer | Uint8Array | string) {
        /*let finalPath = await FileSystem.resolvePath(session, path, false);
        await WriteFile(finalPath, data);*/
        return await FileSystem.getDrive(session, path, 'w').writeFile(data);
    }

    static async rename(session: Session, path: string, name: string) {
        /*if (name.match(/\.{2,}|[\/\\]/g)) throw new Error('Incorrect name');

        let srcPath = await FileSystem.resolvePath(session, path);
        let dstPath = await FileSystem.resolvePath(session, path.split('/').slice(0, -1).join('/') + '/' + name, false);
        await RenamePath(srcPath, dstPath);*/
        return await FileSystem.getDrive(session, path, 'w').rename(name);
    }

    static async remove(session: Session, path: string) {
        /*let finalPath = await FileSystem.resolvePath(session, path);
        await RemoveFolder(finalPath);*/
        return await FileSystem.getDrive(session, path, 'w').remove();
    }

    static getDrive(session: Session, path: string, access: string = 'rw', args:any = {}):IDrive {
        if (!session) throw new Error(`Session is require!`);
        if (!session.isApplicationLevel) throw new Error(`Access denied for this session!`);

        // Make path safe
        path = FileSystem.safePath(path);
        if (path[0] !== '/') path = '/' + path;

        let drive: IDrive;
        let redirect = [
            {
                route: '/$lib',
                access: 'r',
                path: './',
                drive: LibDrive
            },
            {
                route: '/$public',
                access: 'r',
                path: './bin/public/',
                drive: StdDrive
            },
            {
                route: '/$data',
                access: 'rw',
                privilege: {r: 'data', w: 'data'},
                path: session.application.storage,
                drive: StdDrive
            },
            {
                route: '/$user',
                access: 'rw',
                privilege: {r: 'user-readonly', w: 'user'},
                path: `./user/${session.user.name}/docs/`,
                drive: StdDrive
            },
            {
                route: '/$root',
                access: 'rw',
                privilege: {r: 'root-readonly', w: 'root'},
                path: `./`,
                drive: StdDrive
            },
            {
                route: '/$logs',
                access: 'r',
                path: `./logs/${session.key}.json`,
                drive: StdDrive
            },
            {
                route: '/',
                access: 'r',
                path: session.application.path + '/',
                drive: StdDrive
            }
        ];

        // Convert special path folder
        for (let item of redirect) {
            if (path.startsWith(item.route)) {
                // Check base access
                if (access.match('w') && !item.access.match('w'))
                    throw new Error(`Application "${session.application.path}" can't write to "${path}"`);

                // Check app access to write
                if (item.privilege && access.match('r') && !(session.checkAccess(item.privilege.r) || session.checkAccess(item.privilege.w)))
                    throw new Error(`Application "${session.application.name}" doesn't have access to read from "${path}".`);

                // Check app access to write
                if (item.privilege && access.match('w') && !session.checkAccess(item.privilege.w))
                    throw new Error(`Application "${session.application.name}" doesn't have access to write to "${path}".`);

                drive = new item.drive(path.replace(item.route, item.path), args);
                break;
            }
        }

        return drive;
    }

    /**
     * Remove unsafe chars from the path.
     * @param path
     */
    static safePath(path: string) {
        if (!path) return;
        return path.replace(/\\/g, '/')
            .replace(/\.\.|\.\//g, '')
            .replace(/\/+/g, '/');
    }
}