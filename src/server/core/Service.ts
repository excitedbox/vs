import * as Fs from 'fs';
import * as Util from 'util';
import Session from "../user/Session";
import FileSystem from "../fs/FileSystem";
import SystemJournal from "./SystemJournal";

const {NodeVM} = require('vm2');

const Exists = Util.promisify(Fs.exists);

export default class Service {
    static async start(session: Session) {
        if (!session) throw new Error(`Session is require!`);
        if (!session.isApplicationLevel) throw new Error(`Access denied for this session!`);

        // Check if service exists
        if (!await Exists(session.application.path + '/service/index.js')) return;

        // Create virtual environment
        const vm = new NodeVM({
            console: 'off',
            // compiler: 'tsc',
            sandbox: {
                console: {
                    log(msg) {
                        SystemJournal.log(session, msg);
                    },
                    error(msg) {
                        SystemJournal.error(session, msg);
                    }
                }
            },
            eval: false,
            wasm: false,
            require: {
                external: true,
                builtin: ['fs', 'util'],
                root: "./",
                mock: {
                    fs: {
                        readFile: (path, options, callback) => this._fsReadFile(session, path, options, callback),
                        writeFile: (path, options, callback) => this._fsWriteFile(session, path, options, callback),
                        stat: (path, callback) =>  this._fsStat(session, path, callback),
                        exists: (path, callback) => this._fsExists(session, path, callback),
                        mkdir: (path, options, callback) => this._fsMkDir(session, path, options, callback),
                        rename: (oldPath, newPath, callback) => this._fsRename(session, oldPath, newPath, callback),
                        unlink: (path, callback) => this._fsUnlink(session, path, callback),
                        readdir: (path, options, callback) => this._fsReadDir(session, path, options, callback),
                        search: (path, filter) => {},
                        tree: (path, filter) => {},
                    },
                    util: {
                        promisify: Util.promisify
                    }
                }
            }
        });

        // Start service in vm
        let sex = Fs.readFileSync(session.application.path + '/service/index.js', 'utf-8');
        vm.run(sex, session.application.path + '/service/index.js');
    }

    private static async _fsReadFile(session: Session, path: string, options: any, callback: Function) {
        try {
            let data: any = await FileSystem.readFile(session, path);
            if (options === 'utf-8') data = data.toString('utf-8');
            callback(null, data);
        } catch (e) {
            callback(e);
        }
    }

    private static async _fsWriteFile(session: Session, path: string, data: string, callback: Function) {
        try {
            await FileSystem.writeFile(session, path, data);
            callback(null, true);
        } catch (e) {
            callback(e);
        }
    }

    private static async _fsStat(session: Session, path: string, callback: Function) {
        try {
            callback(null, await FileSystem.info(session, path));
        } catch (e) {
            callback(e);
        }
    }

    private static async _fsExists(session: Session, path: string, callback: Function) {
        try {
            callback(null, await FileSystem.exists(session, path));
        } catch (e) {
            callback(e);
        }
    }

    private static async _fsMkDir(session: Session, path: string, options:any, callback: Function) {
        try {
            callback(null, await FileSystem.createDir(session, path));
        } catch (e) {
            callback(e);
        }
    }

    private static async _fsRename(session: Session, path: string, name: string, callback: Function) {
        try {
            callback(null, await FileSystem.rename(session, path, name));
        } catch (e) {
            callback(e);
        }
    }

    private static async _fsUnlink(session: Session, path: string, callback: Function) {
        try {
            callback(null, await FileSystem.remove(session, path));
        } catch (e) {
            callback(e);
        }
    }

    private static async _fsReadDir(session: Session, path: string, options:any, callback: Function) {
        try {
            callback(null, await FileSystem.createDir(session, path));
        } catch (e) {
            callback(e);
        }
    }
}