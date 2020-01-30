import * as Fs from 'fs';
import * as Util from 'util';
import Session from "../user/Session";
import FileSystem from "../fs/FileSystem";

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
                    log(s) {
                        console.log(s);
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
                        async readFile(path, options, callback) {
                            try {
                                let data: any = await FileSystem.readFile(session, path);
                                if (options === 'utf-8') data = data.toString('utf-8');
                                callback(null, data);
                            } catch (e) {
                                callback(e);
                            }
                        },
                        readFileSync(path, options) {
                            throw new Error('Unsupported by security reason. Use readFile instead.');
                        },
                        writeFile(path, data, callback) {
                            throw new Error('Unsupported');
                        }
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
}