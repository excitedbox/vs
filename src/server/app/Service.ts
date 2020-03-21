import * as Fs from 'fs';
import * as Util from 'util';
import Session from "../user/Session";
import FileSystem from "../fs/FileSystem";
import SystemJournal from "../system/SystemJournal";
import Helper from "../system/Helper";
import FunctionHelper from "../../lib/helper/FunctionHelper";

const {NodeVM} = require('vm2');

const Exists = Util.promisify(Fs.exists);

class ServiceParams {
    public intervalKeys: Array<any> = [];
    public timeoutKeys: Array<any> = [];
}

export default class Service {
    public static runningServices: Map<Session, Service> = new Map<Session, Service>();
    public static serviceParams: Map<Service, ServiceParams> = new Map<Service, ServiceParams>();
    public bindingPath: Map<string, Function> = new Map<string, Function>();

    static async start(session: Session) {
        if (!session) throw new Error(`Session is require!`);
        if (!session.isApplicationLevel) throw new Error(`Access denied for this session!`);

        // Check if service exists
        if (!await Exists(session.application.path + '/service/index.js')) return;

        // Create service
        let service = new Service();
        let serviceParams = new ServiceParams();

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
                },
                setInterval: function(fn, time, ...args) {
                    serviceParams.intervalKeys.push(setInterval(fn, time, ...args));
                },
                setTimeout: function(fn, time, ...args) {
                    serviceParams.timeoutKeys.push(setTimeout(fn, time, ...args));
                },
                service
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
                        stat: (path, callback) => this._fsStat(session, path, callback),
                        exists: (path, callback) => this._fsExists(session, path, callback),
                        mkdir: (path, options, callback) => this._fsMkDir(session, path, options, callback),
                        rename: (oldPath, newPath, callback) => this._fsRename(session, oldPath, newPath, callback),
                        unlink: (path, callback) => this._fsUnlink(session, path, callback),
                        readdir: (path, options, callback) => this._fsReadDir(session, path, options, callback),
                        search: (path, filter) => {
                        },
                        tree: (path, filter) => {
                        },
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

        // Save service
        Service.runningServices.set(session, service);
        Service.serviceParams.set(service, serviceParams);
    }

    /**
     * Stop service and remove all service resources.
     * @param session
     */
    static stop(session: Session) {

        if (this.runningServices.has(session)) {
            // Get service and params
            let service = this.runningServices.get(session);
            let params = this.serviceParams.get(service);

            // Destroy all service timers
            params.intervalKeys.forEach(x => clearInterval(x));
            params.timeoutKeys.forEach(x => clearTimeout(x));
            this.serviceParams.delete(service);
        }
        this.runningServices.delete(session);
    }

    listen(path: string, fn: Function) {
        this.bindingPath.set(path, fn);
    }

    async execute(path: string, args: any) {
        if (!this.bindingPath.has(path)) return;
        return await FunctionHelper.callFunctionWithArgumentNames(this.bindingPath.get(path), args);
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

    private static async _fsMkDir(session: Session, path: string, options: any, callback: Function) {
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

    private static async _fsReadDir(session: Session, path: string, options: any, callback: Function) {
        try {
            callback(null, await FileSystem.createDir(session, path));
        } catch (e) {
            callback(e);
        }
    }
}