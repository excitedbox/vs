import * as ReadLine from "readline";
import * as Opn from 'opn';
import User from "../user/User";
import Application from "../app/Application";
import Session from "../user/Session";

export default class ShellApi {
    private static _tmpSession: Session;
    private static _runningApplicationList: Array<Session> = [];

    static async run() {
        // Listen command line
        ReadLine.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        }).on('line', async (line) => {
            await this._processCommand(line);
        });

        // Auth as root
        this._tmpSession = await User.auth('root', '1234');

        // Dummy
        this._processCommand('');
    }

    private static async _processCommand(cmd: string) {
        let cmdParsed = cmd.split(' ');
        let mainCmd = cmdParsed.shift();
        let restCmd = cmdParsed.join(' ');

        try {
            if (mainCmd === 'install') {
                await Application.install(this._tmpSession, cmdParsed.join(' '));
            }
            if (mainCmd === 'run') {
                let appName = cmdParsed.join(' ');
                let db = await Application.getApplicationDb(this._tmpSession.user.name);
                let app = db.get('application').findOne([
                    {repo: new RegExp(appName, 'i')},
                    {name: new RegExp(appName, 'i')},
                    {title: new RegExp(appName, 'i')}
                ]);

                let session = await Application.run(this._tmpSession, app.repo);
                Opn(`http://${session.key}.localhost:${+process.env.OS_PORT + 1}/index.html`);
                console.log(`${app.name}: ${session.key}`);
                this._runningApplicationList.push(session);
            }
            if (mainCmd === 'close') {
                let session = null;
                if (restCmd === 'last') session = this._runningApplicationList.pop();
                if (session) Application.close(this._tmpSession, session.key);
                else console.log('Session not found');
            }
        } catch (e) {
            console.log(e.message);
        }

        if (mainCmd === 'help') {
            console.log('sas');
        }

        if (mainCmd === 'htop') {
            console.log(this._runningApplicationList.map(x => x.application.name + ': ' + x.key));
        }

        process.stdout.write('> ');
    }
}