import JsonDb from "../../lib/db/JsonDb";
import AuthenticationError from "../error/AuthenticationError";
import Session from "./Session";
import SHA256 from "../../lib/crypto/SHA256";
import StringHelper from "../../lib/helper/StringHelper";

export default class User {
    public id: number;
    public name: string;
    public defaultApp: string;

    /**
     * Response types for http server for each method. Method forbidden to call if it's not listed here.
     */
    public static readonly methodResponseType: {} = {
        'auth': 'session'
    };

    constructor({id, name, defaultApp}) {
        this.id = id;
        this.name = name;
        this.defaultApp = defaultApp;
    }

    get homeDir(): string {
        return `./user/${this.name}`;
    }

    get appDir(): string {
        return `./user/${this.name}/bin`;
    }

    get dataDir(): string {
        return `./user/${this.name}/data`;
    }

    get docsDir(): string {
        return `./user/${this.name}/docs`;
    }

    /**
     * Auth user by a login and password. Return accessToken if success.
     * @param name
     * @param password
     */
    static async auth(name: string, password: string): Promise<Session> {
        // Get user and session data bases
        const userDb = await User.getUserDb(); //, sessionDb = await User.getSessionDb();

        // Find user with this login and password
        const user = userDb.get('user').findOne({
            name,
            password: SHA256.encode(password)
        });

        // If ok
        if (user) {
            const sessionKey = StringHelper.generateRandomKey();

            // Save session to session data base
            return new Session(sessionKey, new User(user));
        } else {
            // Incorrect auth
            throw new AuthenticationError('Incorrect a login or password');
        }
    }

    static async getUserDb(): Promise<JsonDb> {
        return await JsonDb.db('./user/list.json', {user: []});
    }
}