import JsonDb from "../../lib/db/JsonDb";
import Helper from "../Helper";

export default class User {
    public id: number;
    public name: string;

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
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

    static async auth(name: string, password: string): Promise<string> {
        // Get user and session data bases
        let userDb = await this.getUserDb(), sessionDb = await this.getSessionDb();

        // Find user with this login and password
        let user = userDb.get('user').findOne({name, password});

        // If ok
        if (user) {
            let sessionKey = Helper.randomKey;

            // Save session to session data base
            await sessionDb.get('session').push({userId: user.id, key: sessionKey}).write();
            return sessionKey;
        } else {
            // Incorrect auth
            // return false;
            throw new Error('Incorrect a login or password');
        }
    }

    static async getBySession(key: string): Promise<User> {
        // Get user and session data bases
        let userDb = await this.getUserDb(), sessionDb = await this.getSessionDb();

        // Find user with this login and password
        let session = sessionDb.get('session').findOne({key});
        if (!session) return null;

        let user = userDb.get('user').findOne({id: session.userId});
        return new User(user) || null;
    }

    static async getUserDb() {
        return await JsonDb.db('./user/list.json', {user: []});
    }

    static async getSessionDb() {
        return await JsonDb.db('./user/session.json', {user: []});
    }
}