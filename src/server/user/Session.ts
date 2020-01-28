import User from "../user/User";
import Application from "../app/Application";

export default class Session {
    public key: string;
    public readonly user: User;
    public readonly application: Application;

    constructor(key: string, user: User, application: Application = null) {
        this.key = key;
        this.user = user;
        this.application = application;
    }

    checkAccess(access: string): boolean {
        if ((access === 'root' || access === 'root-readonly') && this.user.name !== 'root')
            return false;

        return false;
    }
}