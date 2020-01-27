import * as Fs from 'fs';
import * as Util from 'util';
import * as Path from 'path';
import Session from "../user/Session";

const ReadFile = Util.promisify(Fs.readFile);

export default class FileSystem {
    static fileInfo(session: Session, path: string) {
        return this.resolvePath(session, path);
    }

    static readFile(session: Session, path: string) {
        return this.resolvePath(session, path);
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

    static resolvePath(session: Session, path: string) {
        path = this.safePath(path);

        if (path.startsWith('/$lib')) path = path.replace('/$lib', './src/lib');
        else if (path.startsWith('/$data')) path = path.replace('/$data', './user/root/data/app');
        else if (path.startsWith('/$user')) path = path.replace('/$user', './user/root/docs');
        else if (path.startsWith('/$root')) path = path.replace('/$root', './');
        else if (path.startsWith('/$public')) path = path.replace('/$root', './bin/public');
        else path = path.replace('/', './user/root/bin/app');

        return Path.resolve(__dirname + '/../../../', path).replace(/\\/g, '/');
    }

    static safePath(path: string) {
        if (!path) return;
        return path.replace(/\.\.|\.\//g, '').replace(/\/+/g, '/');
    }
}