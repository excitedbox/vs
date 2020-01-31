import * as Fs from 'fs';
import * as Util from 'util';
import Session from "../user/Session";
import User from "../user/User";
import JsonDb from "../../lib/db/JsonDb";
import Application from "../app/Application";

const WriteFile = Util.promisify(Fs.writeFile);

export default class SystemJournal {
    private static _logs: JsonDb;

    static async init() {
        this._logs = await JsonDb.db('./logs/logs.json', { logs: [] });

        setInterval(() => {
            this.flushLogs();
        }, 15000);
    }

    static log(session: Session, message: string) {
        this._add(session, 'log', message);
    }

    static error(session: Session, message: string) {
        this._add(session, 'error', message);
    }

    static _add(session: Session, type:string, message: string) {
        if (!session) return;
        if (!session.isApplicationLevel) return;

        this._logs.get('logs').push({
            type: type,
            key: session.key,
            userId: session.user.id,
            applicationId: session.application.id,
            message: message + '',
            created: new Date()
        });
    }

    static async flushLogs() {
        await this._logs.write();

        // Save logs to file
        Application.runningApplications.forEach(x => {
            let logs = SystemJournal.getSessionLogs(x);
            WriteFile(`./logs/${x.key}.json`, JSON.stringify(logs));
        });
    }

    static getSessionLogs(session: Session) {
        return this._logs.get('logs').find({ key: session.key });
    }

    static getUserLogs(user: User) {
        let out = [];
    }
}