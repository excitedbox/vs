import User from "../user/User";
import Application from "../app/Application";

export default class Session {
    public readonly user: User;
    public readonly application: Application;

    checkAccess(access: string): boolean {
        if ((access === 'root' || access === 'root-readonly') && this.user.name !== 'root')
            return false;

        return false;
    }
}