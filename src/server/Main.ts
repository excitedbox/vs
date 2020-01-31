import * as Fs from 'fs';
import AppServer from "./core/AppServer";
import OsServer from "./core/OsServer";
import ShellApi from "./system/ShellApi";
import SystemJournal from "./system/SystemJournal";
import Application from "./app/Application";
import Service from "./app/Service";
import "../lib/extender/StringExtender";

export default class Main {
    static async run(isDebug: boolean = false) {
        // Import .env config
        require('dotenv').config();

        // Init directories and other stuff
        Main.defaultInit();

        // Init system journal for logs
        await SystemJournal.init();

        // Run os server
        await OsServer.run(+process.env.OS_PORT + (isDebug ? 100 : 0));

        // Run app server
        await AppServer.run(+process.env.OS_PORT + 1 + (isDebug ? 100 : 0));

        // Run shell api for command input from terminal
        await ShellApi.run();
    }

    static async stop() {
        Application.runningApplications.forEach(x => {
            Service.stop(x);
        });
        Application.runningApplications.clear();
        Service.runningServices.clear();
        OsServer.stop();
        AppServer.stop();
        SystemJournal.stop();
        ShellApi.stop();
    }

    /**
     * Init default files and directories. When you run server for the first time
     * it will create default files, config, directories and other stuff for server work.
     */
    static defaultInit() {
        ['root', 'test'].forEach(x => {
            // Create default folders
            Fs.mkdirSync('./logs', {recursive: true});
            Fs.mkdirSync('./bin/lib', {recursive: true});
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
// Main.run();