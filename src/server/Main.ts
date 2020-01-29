import * as Fs from 'fs';
import AppServer from "./core/AppServer";
import OsServer from "./core/OsServer";
import FileSystem from "./fs/FileSystem";
import User from "./user/User";
import JsonDb from "../lib/db/JsonDb";

class Main {
    constructor() {
        // Import .env config
        require('dotenv').config();

        // Init directories and other stuff
        Main.defaultInit();

        // Run os server
        OsServer.run(+process.env.OS_PORT);

        // Run app server
        AppServer.run(+process.env.OS_PORT + 1);
    }

    /**
     * Init default files and directories. When you run server for the first time
     * it will create default files, config, directories and other stuff for server work.
     */
    static defaultInit() {
        // Create default folders
        Fs.mkdirSync('./bin/public', {recursive: true});
        Fs.mkdirSync('./user/root', {recursive: true});
        Fs.mkdirSync('./user/root/bin', {recursive: true});
        Fs.mkdirSync('./user/root/data', {recursive: true});
        Fs.mkdirSync('./user/root/docs', {recursive: true});

        // Create default user list
        if (!Fs.existsSync('./user/list.json')) {
            Fs.writeFileSync('./user/list.json', JSON.stringify({
                user: [
                    {
                        id: 1,
                        name: 'root',
                        password: process.env.DEFAULT_ROOT_PASSWORD || 'root'
                    }
                ]
            }, null, 4));
        }
    }
}

new Main();