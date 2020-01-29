import * as Fs from 'fs';
import * as Util from 'util';
import * as Path from 'path';
import Session from "../user/Session";

const ReadFile = Util.promisify(Fs.readFile);
const Exists = Util.promisify(Fs.exists);

export default class FileSystem {
    static fileInfo(session: Session, path: string) {
        return this.resolvePath(session, path);
    }

    static async readFile(session: Session, path: string) {
        let finalPath = await this.resolvePath(session, path);
        console.log(finalPath);
        return await ReadFile(finalPath);
    }

    static list(session: Session, path: string, filter: string = '') {
        return this.resolvePath(session, path);
    }

    static tree(session: Session, path: string, filter: string = '') {
        return this.resolvePath(session, path);
    }

    static exists(session: Session, path: string) {

    }

    static search(session: Session, path: string, filter: string = '') {

    }

    static createDir(session: Session, path: string) {

    }

    static writeFile(session: Session, path: string, data: Buffer) {

    }

    static rename(session: Session, path: string, name: string) {

    }

    static remove(session: Session, path: string) {

    }

    /**
     * Resolve a virtual path for application.
     * @param session
     * @param path
     */
    static async resolvePath(session: Session, path: string): Promise<string> {
        if (!session) throw new Error(`Session is require!`);
        if (!session.isApplicationLevel) throw new Error(`Access denied for this session!`);

        // Make path safe
        path = this.safePath(path);
        if (path[0] !== '/') path = '/' + path;

        // Convert special path folder
        if (path.startsWith('/$lib')) path = path.replace('/$lib', './src/lib/');
        else if (path.startsWith('/$public')) path = path.replace('/$root', './bin/public/');
        else if (path.startsWith('/$data')) {
            if (!session.checkAccess('data'))
                throw new Error(`Application "${session.application.name}" doesn't have access to $data folder.`);
            path = path.replace('/$data', `./user/${session.user.name}/data/app/`);
        }
        else if (path.startsWith('/$user')) {
            if (!session.checkAccess('user-readonly'))
                throw new Error(`Application "${session.application.name}" doesn't have access to $user folder.`);
            path = path.replace('/$user', `./user/${session.user.name}/docs/`);
        }
        else if (path.startsWith('/$root')) {
            if (!session.checkAccess('root-readonly'))
                throw new Error(`Application "${session.application.name}" doesn't have access to $root folder.`);
            path = path.replace('/$root', './');
        }
        else path = path.replace('/', session.application.path + '/');

        // Generate final path
        let finalPath = this.safePath(Path.resolve(__dirname + '/../../../', path)
            .replace(/\\/g, '/'));

        // Check if path exists
        let status = await Exists(finalPath);
        if (!status) throw new Error(`Path "${finalPath}" not exists!`);

        return finalPath;
    }

    /**
     * Remove unsafe chars from the path.
     * @param path
     */
    static safePath(path: string) {
        if (!path) return;
        return path.replace(/\.\.|\.\//g, '').replace(/\/+/g, '/');
    }
}