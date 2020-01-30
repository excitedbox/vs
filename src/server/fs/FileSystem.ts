import * as Fs from 'fs';
import * as Util from 'util';
import * as Path from 'path';
import Session from "../user/Session";
import * as Rimraf from "rimraf";

const ReadFile = Util.promisify(Fs.readFile);
const Exists = Util.promisify(Fs.exists);
const MkDir = Util.promisify(Fs.mkdir);
const RemoveFolder = Util.promisify(Rimraf);

export default class FileSystem {
    /**
     * Response types for http server for each method. Method forbidden to call if it's not listed here.
     */
    public static readonly methodResponseType: any = {
        'exists': 'json',
    };

    static fileInfo(session: Session, path: string) {
        return FileSystem.resolvePath(session, path);
    }

    static async readFile(session: Session, path: string) {
        let finalPath = await FileSystem.resolvePath(session, path);
        return await ReadFile(finalPath);
    }

    static list(session: Session, path: string, filter: string = '') {
        return FileSystem.resolvePath(session, path);
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

    static search(session: Session, path: string, filter: string = '') {

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

    static writeFile(session: Session, path: string, data: Buffer) {

    }

    static rename(session: Session, path: string, name: string) {

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
        }
        else if (path.startsWith('/$public')) {
            if (access.match('w')) throw new Error(`Application "${session.application.path}" can't write to "${path}"`);
            path = path.replace('/$root', './bin/public/');
        }
        else if (path.startsWith('/$data')) {
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