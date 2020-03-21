import * as Fs from 'fs';
import * as Util from 'util';
import Session from "../user/Session";
import StdDrive from "./drive/StdDrive";
import IDrive from "./drive/IDrive";
import LibDrive from "./drive/LibDrive";
import {WriteStream} from "fs";

const ReadFile = Util.promisify(Fs.readFile);

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
        'readFile': 'binary',
    };

    static async info(session: Session, path: string) {
        return await FileSystem.getDrive(session, path, 'r').info();
    }

    static async readFile(session: Session, path: string, args: {} = {}) {
        return await FileSystem.getDrive(session, path, 'r', args).readFile();
    }

    static async list(session: Session, path: string, filter: string = '') {
        return await FileSystem.getDrive(session, path, 'r').list(filter);
    }

    static async search(session: Session, path: string, filter: string = '') {
        return await FileSystem.getDrive(session, path, 'r').search(filter);
    }

    static async tree(session: Session, path: string, filter: string = '') {
        return await FileSystem.getDrive(session, path, 'r').tree(filter);
    }

    static async exists(session: Session, path: string): Promise<any> {
        return {status: await FileSystem.getDrive(session, path, 'r').exists()};
    }

    static async createDir(session: Session, path: string) {
        return await FileSystem.getDrive(session, path, 'w').createDir();
    }

    static async writeFile(session: Session, path: string, data: Buffer | Uint8Array | string) {
        // Probably express File
        if (data['_writeStream'] instanceof WriteStream)
            data = await ReadFile(data['path']);

        return await FileSystem.getDrive(session, path, 'w').writeFile(data);
    }

    static async rename(session: Session, path: string, name: string) {
        return await FileSystem.getDrive(session, path, 'w').rename(name);
    }

    static async remove(session: Session, path: string) {
        return await FileSystem.getDrive(session, path, 'w').remove();
    }

    static getDrive(session: Session, path: string, access: string = 'rw', args: { [key: string]: {} } = {}): IDrive {
        if (!session) {
            throw new Error(`Session is require!`);
        }
        if (!session.isApplicationLevel) {
            throw new Error(`Access denied for this session!`);
        }

        // Default args
        args.sourcePath = path;

        // Make path safe
        path = FileSystem.safePath(path);
        if (path[0] !== '/') {
            path = '/' + path;
        }

        let drive: IDrive;
        const redirect = [
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
        for (const item of redirect) {
            if (path.startsWith(item.route)) {
                // Check base access
                if (access.match('w') && !item.access.match('w')) {
                    throw new Error(`Application "${session.application.path}" can't write to "${path}"`);
                }

                // Check app access to write
                if (item.privilege && access.match('r') && !(session.checkAccess(item.privilege.r) || session.checkAccess(item.privilege.w))) {
                    throw new Error(`Application "${session.application.name}" doesn't have access to read from "${path}".`);
                }

                // Check app access to write
                if (item.privilege && access.match('w') && !session.checkAccess(item.privilege.w)) {
                    throw new Error(`Application "${session.application.name}" doesn't have access to write to "${path}".`);
                }

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
    static safePath(path: string): string {
        if (!path) {
            return;
        }
        return path.replace(/\\/g, '/')
            .replace(/\.\.|\.\//g, '')
            .replace(/\/+/g, '/');
    }
}