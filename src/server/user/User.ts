import JsonDb from "../../lib/db/JsonDb";
import Helper from "../core/Helper";
import AuthenticationError from "../error/AuthenticationError";
import Session from "./Session";

export default class User {
    public id: number;
    public name: string;

    /**
     * Response types for http server for each method. Method forbidden to call if it's not listed here.
     */
    public static readonly methodResponseType: any = {
        'auth': 'session'
    };

    constructor({ id, name }) {
        this.id = id;
        this.name = name;
    }

    get homeDir() {
        return `./user/${this.name}`;
    }

    get appDir() {
        return `./user/${this.name}/bin`;
    }

    get dataDir() {
        return `./user/${this.name}/data`;
    }

    get docsDir() {
        return `./user/${this.name}/docs`;
    }

    /**
     * Auth user by a login and password. Return accessToken if success.
     * @param name
     * @param password
     */
    static async auth(name: string, password: string): Promise<Session> {
        // Get user and session data bases
        let userDb = await User.getUserDb(), sessionDb = await User.getSessionDb();

        // Find user with this login and password
        let user = userDb.get('user').findOne({name, password});

        // If ok
        if (user) {
            let sessionKey = Helper.randomKey;

            // Save session to session data base
            await sessionDb.get('session').push({userId: user.id, key: sessionKey}).write();
            return new Session(sessionKey, new User(user));
        } else {
            // Incorrect auth
            // return false;
            throw new AuthenticationError('Incorrect a login or password');
        }
    }

    /**
     * Get user from db by accessToken.
     * @param key
     */
    static async getBySession(key: string): Promise<User> {
        if (!key) throw new AuthenticationError('Incorrect access token');

        // Get user and session data bases
        let userDb = await User.getUserDb(), sessionDb = await User.getSessionDb();

        // Find user with this login and password
        let session = sessionDb.get('session').findOne({key});
        if (!session) throw new AuthenticationError('Session not found!');

        let user = userDb.get('user').findOne({id: session.userId});
        if (!user) throw new AuthenticationError('User not found!');
        return new User(user);
    }

    static async getUserDb() {
        return await JsonDb.db('./user/list.json', {user: []});
    }

    static async getSessionDb() {
        return await JsonDb.db('./user/session.json', {user: []});
    }
}