import * as Fs from 'fs';
import AppServer from "./core/AppServer";
import OsServer from "./core/OsServer";
import FileSystem from "./fs/FileSystem";
import User from "./user/User";
import JsonDb from "../lib/db/JsonDb";
import Application from "./app/Application";
import Session from "./user/Session";
import ShellApi from "./core/ShellApi";

class Main {
    static async run() {
        // Import .env config
        require('dotenv').config();

        // Init directories and other stuff
        Main.defaultInit();

        // Run os server
        await OsServer.run(+process.env.OS_PORT);

        // Run app server
        await AppServer.run(+process.env.OS_PORT + 1);

        await ShellApi.run();
    }

    /**
     * Init default files and directories. When you run server for the first time
     * it will create default files, config, directories and other stuff for server work.
     */
    static defaultInit() {
        ['root', 'test'].forEach(x => {
            // Create default folders
            Fs.mkdirSync('./bin/public', {recursive: true});
            Fs.mkdirSync(`./user/${x}`, {recursive: true});
            Fs.mkdirSync(`./user/${x}/bin`, {recursive: true});
            Fs.mkdirSync(`./user/${x}/data`, {recursive: true});
            Fs.mkdirSync(`./user/${x}/docs`, {recursive: true});
        });

        // Create default user list
        if (!Fs.existsSync('./user/list.json')) {
            Fs.writeFileSync('./user/list.json', JSON.stringify({
                user: [
                    {
                        id: 1,
                        name: 'root',
                        password: process.env.DEFAULT_ROOT_PASSWORD || 'root'
                    },
                    {
                        id: 2,
                        name: 'test',
                        password: 'test123'
                    }
                ]
            }, null, 4));
        }
    }
}

// Start server
Main.run();