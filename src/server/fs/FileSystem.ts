import * as Fs from 'fs';
import * as Util from 'util';
import * as Path from 'path';
import Session from "../user/Session";
import * as Rimraf from "rimraf";

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

    /**
     * Get info about a file or folder.
     * @param session
     * @param path
     */
    static async info(session: Session, path: string) {
        let finalPath = await FileSystem.resolvePath(session, path, true, 'r');
        return await StatFile(finalPath);
    }

    /**
     * Read file and return file content
     * @param session
     * @param path
     */
    static async readFile(session: Session, path: string) {
        let finalPath = await FileSystem.resolvePath(session, path, true, 'r');
        return await ReadFile(finalPath);
    }

    /**
     * Get file and folder list from the path.
     * @param session
     * @param path
     * @param filter
     */
    static async list(session: Session, path: string, filter: string = '') {
        let finalPath = await FileSystem.resolvePath(session, path, true, 'r');
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

        return list;
    }

    static search(session: Session, path: string, filter: string = '') {

    }

    static tree(session: Session, path: string, filter: string = '') {
        return FileSystem.resolvePath(session, path);
    }

    /**
     * Check if file or folder exists
     * @param session
     * @param path
     */
    static async exists(session: Session, path: string) {
        let finalPath = await FileSystem.resolvePath(session, path, false, 'r');
        return {status: await Exists(finalPath)};
    }

    /**
     * Create folder
     * @param session
     * @param path
     */
    static async createDir(session: Session, path: string) {
        let finalPath = await FileSystem.resolvePath(session, path, false);
        await MkDir(finalPath, {recursive: true});
        if (!await this.exists(session, finalPath)) throw new Error(`Can't create the directory "${finalPath}"`);
    }

    /**
     * Write file data. Create a file if it's not exists.
     * @param session
     * @param path
     * @param data
     */
    static async writeFile(session: Session, path: string, data: Buffer | Uint8Array | string) {
        let finalPath = await FileSystem.resolvePath(session, path, false);
        await WriteFile(finalPath, data);
    }

    /**
     * Rename a file or folder.
     * @param session
     * @param path
     * @param name
     */
    static async rename(session: Session, path: string, name: string) {
        if (name.match(/\.{2,}|[\/\\]/g)) throw new Error('Incorrect name');

        let srcPath = await FileSystem.resolvePath(session, path);
        let dstPath = await FileSystem.resolvePath(session, path.split('/').slice(0, -1).join('/') + '/' + name, false);
        await RenamePath(srcPath, dstPath);
    }

    /**
     * Remove file or folder
     * @param session
     * @param path
     */
    static async remove(session: Session, path: string) {
        let finalPath = await FileSystem.resolvePath(session, path);
        await RemoveFolder(finalPath);
    }

    /**
     * Resolve a virtual path for application.
     * @param session
     * @param path
     * @param checkIfExists
     * @param access
     */
    static async resolvePath(session: Session, path: string, checkIfExists: boolean = true, access: string = 'rw'): Promise<string> {
        if (!session) throw new Error(`Session is require!`);
        if (!session.isApplicationLevel) throw new Error(`Access denied for this session!`);

        // Make path safe
        path = FileSystem.safePath(path);
        if (path[0] !== '/') path = '/' + path;

        // Convert special path folder
        if (path.startsWith('/$lib')) {
            if (access.match('w')) throw new Error(`Application "${session.application.path}" can't write to "${path}"`);
            path = path.replace('/$lib', './src/lib/');
        } else if (path.startsWith('/$public')) {
            if (access.match('w')) throw new Error(`Application "${session.application.path}" can't write to "${path}"`);
            path = path.replace('/$public', './bin/public/');
        } else if (path.startsWith('/$data')) {
            // Check access to data folder
            if (!session.checkAccess('data'))
                throw new Error(`Application "${session.application.name}" doesn't have access to $data folder.`);
            path = path.replace('/$data', session.application.storage);
        } else if (path.startsWith('/$user')) {
            // Check access to user folder, at least readonly
            if (!session.checkAccess('user-readonly'))
                throw new Error(`Application "${session.application.name}" doesn't have access to $user folder.`);
            // If want to write but doesn't have privilege
            if (access.match('w') && !session.checkAccess('user'))
                throw new Error(`Application "${session.application.path}" can't write to "${path}"`);
            // Ok
            path = path.replace('/$user', `./user/${session.user.name}/docs/`);
        } else if (path.startsWith('/$root')) {
            // Check access to root folder, at least readonly
            if (!session.checkAccess('root-readonly'))
                throw new Error(`Application "${session.application.name}" doesn't have access to $root folder.`);
            // If want to write but doesn't have privilege
            if (access.match('w') && !session.checkAccess('root'))
                throw new Error(`Application "${session.application.path}" can't write to "${path}"`);
            // Ok
            path = path.replace('/$root', './');
        } else {
            // You can't write to app folder it's readonly
            if (access.match('w'))
                throw new Error(`Application "${session.application.path}" can't write to "${path}"`);
            // Ok
            path = path.replace('/', session.application.path + '/');
        }

        // Generate final path
        let finalPath = FileSystem.safePath(Path.resolve(__dirname + '/../../../', path)
            .replace(/\\/g, '/'));

        // Check if path exists
        if (checkIfExists) {
            let status = await Exists(finalPath);
            if (!status) throw new Error(`Path "${finalPath}" not exists!`);
        }

        return finalPath;
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