import JsonDb from "../../lib/db/JsonDb";

export default class User {
    public name: string = "";

    static async auth(name: string, password: string) {
        // Get user and session data bases
        let userDb = await JsonDb.db('./user/list.json', {user: []});
        let sessionDb = await JsonDb.db('./user/session.json', {session: []});

        // Find user with this login and password
        let user = userDb.get('user').findOne({name, password});

        // If ok
        if (user) {
            // Save session to session data base
            await sessionDb.get('session').push({
                userId: user.id,
                key: Math.random() + ''
            }).write();
            return true;
        } else {
            // Incorrect auth
            return false;
        }
    }

    static async getBySession(key: string) {
        // Get user and session data bases
        let userDb = await JsonDb.db('./user/list.json', {user: []});
        let sessionDb = await JsonDb.db('./user/session.json', {session: []});

        // Find user with this login and password
        let session = sessionDb.get('session').findOne({key});
        if (!session) return null;

        let user = userDb.get('user').findOne({id: session.userId});
        return user || null;
    }
}