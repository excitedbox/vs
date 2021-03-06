import * as ReadLine from "readline";
import * as Opn from 'opn';
import * as Fs from 'fs';
import * as Util from 'util';
import * as Ncp from 'ncp';
import User from "../user/User";
import Application from "../app/Application";
import Session from "../user/Session";
import Service from "../app/Service";

const Exists = Util.promisify(Fs.exists);
const NCP = Util.promisify(Ncp);

export default class ShellApi {
    private static _tmpSession: Session;
    private static _runningApplicationList: Session[] = [];
    private static _lineReader: any;

    static async run() {
        // Listen command line
        this._lineReader = ReadLine.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        }).on('line', async (line: string) => {
            await this._processCommand(line);
        });

        // Auth
        this._tmpSession = await User.auth(process.env.SHELL_LOGIN, process.env.SHELL_PASSWORD);
        console.log(`You are log in as "${process.env.SHELL_LOGIN}"`);

        // Run static applications
        const appDb = await Application.getApplicationDb('root');
        const apps = appDb.get('application').find({isStatic: true});
        for (let i = 0; i < apps.length; i++) {
            await this._processCommand(`run ${apps[i].repo}`);
        }

        // Dummy
        this._processCommand('');
    }

    static stop() {
        this._lineReader.close();
        this._lineReader.removeAllListeners();
    }

    private static async _processCommand(cmd: string): Promise<void> {
        const cmdParsed = cmd.split(' ');
        const mainCmd = cmdParsed.shift();
        const restCmd = cmdParsed.join(' ');

        try {
            // Init system
            if (mainCmd === 'init') {
                // Install basic application
                await Application.silentInstall(this._tmpSession, 'https://github.com/maldan/vs-auth.git');
                await Application.silentInstall(this._tmpSession, 'https://github.com/maldan/vs-standard-wm.git');

                // Set full access
                await Application.updatePrivileges(this._tmpSession, 'https://github.com/maldan/vs-auth.git', ['*']);
                await Application.updatePrivileges(this._tmpSession, 'https://github.com/maldan/vs-standard-wm.git', ['*']);
                console.log('You need to restart virtual system to apply changes');
            }

            // Install application
            if (mainCmd === 'install') {
                await Application.install(this._tmpSession, cmdParsed.join(' '));
            }

            // Install service
            if (mainCmd === 'install_service') {
                await Service.install(this._tmpSession, cmdParsed.join(' '));
            }

            // Run application
            if (mainCmd === 'run' || mainCmd === 'open') {
                const session = await Application.run(this._tmpSession, cmdParsed.join(' '));
                if (mainCmd === 'open') {
                    Opn(`http://${session.key}.${process.env.DOMAIN}:${+process.env.PORT + 1}/index.html`);
                }
                console.log(`${session.application.name}: ${session.key}`);
                this._runningApplicationList.push(session);
            }

            // Update application
            if (mainCmd === 'update') {
                // Update this app
                await Application.pullUpdate(this._tmpSession, cmdParsed.join(' '));
            }

            // Close application
            if (mainCmd === 'close') {
                let session = null;
                if (restCmd === 'last') {
                    session = this._runningApplicationList.pop();
                }
                if (session) {
                    await Application.close(this._tmpSession, session.key);
                } else {
                    console.log('Session not found');
                }
            }

            // Remove application
            if (mainCmd === 'remove') {
                await Application.remove(this._tmpSession, cmdParsed.join(' '));
            }

            if (mainCmd === 'help') {
                console.log('sas');
            }

            // Show running applications
            if (mainCmd === 'htop') {
                Application.runningApplications.forEach((x: Session) => {
                    console.log(x.application.name + ': ' + x.key);
                });
            }

            // Auth as other user
            if (mainCmd === 'auth') {
                this._tmpSession = await User.auth(cmdParsed[0], cmdParsed[1]);
                console.log(`You logged as ${this._tmpSession.user.name}`);
            }

            if (mainCmd === 'template') {
                const [appPath, type] = cmdParsed;
                const finalPath = `./user/${this._tmpSession.user.name}/bin/${appPath}`;
                const isExist = await Exists(finalPath);

                if (!isExist) {
                    console.log(`Folder "${finalPath}" not found`);
                    return;
                }

                if (!['webpack-vue'].includes(type)) {
                    console.log(`Unknown type "${type}"`);
                    return;
                }

                await NCP('./extra/template/webpack-vue', finalPath);
            }
        } catch (e) {
            console.log(e.message);
        }

        process.stdout.write(`${this._tmpSession.user.name}:~# `);
    }
}