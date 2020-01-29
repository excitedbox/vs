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

    get isUserLevel(): boolean {
        return !!this.user;
    }

    get isApplicationLevel(): boolean {
        return this.isUserLevel && !!this.application;
    }

    /**
     * Check access for this session.
     * @param access
     */
    checkAccess(access: string): boolean {
        // Root access
        if ((access === 'root' || access === 'root-readonly') && this.user.name !== 'root')
            return false;

        // Access to data folder
        if (access === 'data' && this.application.hasAccess('data')) return true;

        // Access to user folder
        if (access === 'user' && this.application.hasAccess('user')) return true;

        // Access to user folder but readonly
        if (access === 'user-readonly'
            && (this.application.hasAccess('user-readonly') || this.application.hasAccess('user')))
            return true;

        return false;
    }
}