import * as ReadLine from "readline";
import * as Opn from 'opn';
import User from "../user/User";
import Application from "../app/Application";
import Session from "../user/Session";
import Service from "../app/Service";

export default class ShellApi {
    private static _tmpSession: Session;
    private static _runningApplicationList: Array<Session> = [];
    private static _lineReader:any;

    static async run() {
        // Listen command line
        this._lineReader = ReadLine.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        }).on('line', async (line) => {
            await this._processCommand(line);
        });

        // Auth as root
        this._tmpSession = await User.auth(process.env.SHELL_LOGIN, process.env.SHELL_PASSWORD);
        console.log(`You are log in as "${process.env.SHELL_LOGIN}"`);

        let appDb = await Application.getApplicationDb('root');
        let apps = appDb.get('application').find({ isStatic: true });

        for (let i = 0; i < apps.length; i++) {
            await this._processCommand(`run ${apps[i].repo}`);
            console.log();
        }

        // Dummy
        this._processCommand('');
    }

    static stop() {
        this._lineReader.close();
        this._lineReader.removeAllListeners();
    }

    private static async _processCommand(cmd: string) {
        let cmdParsed = cmd.split(' ');
        let mainCmd = cmdParsed.shift();
        let restCmd = cmdParsed.join(' ');

        try {
            if (mainCmd === 'install') {
                await Application.install(this._tmpSession, cmdParsed.join(' '));
            }
            if (mainCmd === 'run' || mainCmd === 'open') {
                let appName = cmdParsed.join(' ');
                let db = await Application.getApplicationDb(this._tmpSession.user.name);
                let app = db.get('application').findOne([
                    {repo: new RegExp(appName, 'i')},
                    {name: new RegExp(appName, 'i')},
                    {title: new RegExp(appName, 'i')}
                ]);

                let session = await Application.run(this._tmpSession, app.repo);

                if (mainCmd === 'open') Opn(`http://${session.key}.localhost:${+process.env.OS_PORT + 1}/index.html`);
                console.log(`${app.name}: ${session.key}`);
                this._runningApplicationList.push(session);
            }
            if (mainCmd === 'update') {
                let appName = cmdParsed.join(' ');
                let db = await Application.getApplicationDb(this._tmpSession.user.name);
                let app = db.get('application').findOne([
                    {repo: new RegExp(appName, 'i')},
                    {name: new RegExp(appName, 'i')},
                    {title: new RegExp(appName, 'i')}
                ]);

                // Update this app
                await Application.pullUpdate(this._tmpSession, app.repo);
            }
            if (mainCmd === 'close') {
                let session = null;
                if (restCmd === 'last') session = this._runningApplicationList.pop();
                if (session) Application.close(this._tmpSession, session.key);
                else console.log('Session not found');
            }
            if (mainCmd === 'remove') {
                await Application.remove(this._tmpSession, cmdParsed.join(' '));
            }

            if (mainCmd === 'help') {
                console.log('sas');
            }

            if (mainCmd === 'htop') {
                console.log(this._runningApplicationList.map(x => x.application.name + ': ' + x.key));
            }

            if (mainCmd === 'auth') {
                this._tmpSession = await User.auth(cmdParsed[0], cmdParsed[1]);
                console.log(`You logged as ${this._tmpSession.user.name}`);
                // console.log(this._runningApplicationList.map(x => x.application.name + ': ' + x.key));
            }
        } catch (e) {
            console.log(e.message);
        }

        process.stdout.write('> ');
    }
}