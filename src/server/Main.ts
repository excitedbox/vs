import * as Fs from 'fs';
import * as ChildProcess from 'child_process';
import AppServer from "./core/AppServer";
import EntryServer from "./core/EntryServer";
import ShellApi from "./system/ShellApi";
import SystemJournal from "./system/SystemJournal";
import Application from "./app/Application";
import Service from "./app/Service";
import "../lib/extender/NumberExtender";
import "../lib/extender/StringExtender";
import "../lib/extender/ArrayExtender";
import "../lib/extender/DateExtender";
import User from "./user/User";
import SHA256 from "../lib/crypto/SHA256";
import JsonDb from "../lib/db/JsonDb";
import SSHServer from "./core/SSHServer";
import IPC from "./system/IPC";

export default class Main {
    static async run(isDebug: boolean = false): Promise<void> {
        // Import .env config
        require('dotenv').config();

        // Init directories and other stuff
        await Main.defaultInit();

        // Init system journal for logs
        await SystemJournal.init();

        // Run os server
        await EntryServer.run(+process.env.PORT + (isDebug ? 100 : 0));

        // Run app server
        await AppServer.run(+process.env.PORT + 1 + (isDebug ? 100 : 0));

        // Run ssh server
        await SSHServer.run(+process.env.PORT + 2 + (isDebug ? 100 : 0));

        // Run shell api for command input from terminal
        await ShellApi.run();

        // Run all services
        const serviceList = await Service.list();
        for (let i = 0; i < serviceList.length; i++) {
            const child = ChildProcess.spawn(`ts-node`, [serviceList[i].path], {
                stdio: [0, 1, 2, 'ipc']
            });

            IPC.addService(serviceList[i].name, child);
        }

        /*console.time('sex');
        const resp = await IPC.send('fs', 'json', {
            type: 'read',
            path: '/home/maldan/work/nodejs/vs/package.json'
        });
        console.log(resp.toString('utf-8'));
        console.timeEnd('sex');*/
    }

    static async stop(): Promise<void> {
        Application.runningApplications.forEach(x => {
            // Service.stop(x);
        });
        Application.runningApplications.clear();
        // Service.runningServices.clear();
        EntryServer.stop();
        AppServer.stop();
        SystemJournal.stop();
        SSHServer.stop();
        ShellApi.stop();
    }

    /**
     * Init default files and directories. When you run server for the first time
     * it will create default files, config, directories and other stuff for server work.
     */
    static async defaultInit(): Promise<void> {
        ['root', 'test'].forEach((x: string) => {
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
            const userDb = await JsonDb.db('./user/list.json');

            // Need for auth
            const realPassword = {
                [SHA256.encode('1234')]: '1234',
                [SHA256.encode('test1234')]: 'test1234',
            };

            // Push default user
            userDb.get('user', true).push([
                {
                    name: 'root',
                    password: SHA256.encode('1234'),
                    defaultApp: "https://github.com/maldan/vde-standard-wm.git"
                },
                {
                    name: 'test',
                    password: SHA256.encode('test1234'),
                    defaultApp: "https://github.com/maldan/vde-standard-wm.git"
                }
            ]);

            // Store db
            await userDb.write();

            // Get user list and install default applications
            const users = userDb.get('user').find();
            for (let i = 0; i < users.length; i++) {
                console.log(`Auth as ${users[i].name}`);
                const tempSession = await User.auth(users[i].name, realPassword[users[i].password]);

                // Install basic application
                console.log(`Install default applications...`);
                await Application.silentInstall(tempSession, 'https://github.com/maldan/vs-auth.git');
                await Application.silentInstall(tempSession, 'https://github.com/maldan/vs-standard-wm.git');
                await Application.silentInstall(tempSession, 'https://github.com/maldan/vs-terminal.git');
            }
        }
    }
}