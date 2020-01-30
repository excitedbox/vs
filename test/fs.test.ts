import * as Chai from 'chai';
import User from "../src/server/user/User";
import Application from "../src/server/app/Application";
import Session from "../src/server/user/Session";
import AuthenticationError from "../src/server/error/AuthenticationError";
import FileSystem from "../src/server/fs/FileSystem";

describe('Base', function () {
    Chai.use(require('chai-as-promised'));

    let session;
    let appSession;

    it('session', async function () {
        session = await User.auth('test', 'test123');
    });

    it('safe path', async function () {
        Chai.expect(FileSystem.safePath('../../')).eq('/');
        Chai.expect(FileSystem.safePath('./../../../')).eq('/');
        Chai.expect(FileSystem.safePath('./../b/../../')).eq('/b/');
        Chai.expect(FileSystem.safePath('\\..\\..\\')).eq('/');
        Chai.expect(FileSystem.safePath('.')).eq('.');
        Chai.expect(FileSystem.safePath('/./a')).eq('/a');
        Chai.expect(FileSystem.safePath('..')).eq('');
        Chai.expect(FileSystem.safePath(null)).eq(undefined);
    });

    it('install app', async function () {
        this.timeout(60000);

        // Install correct with session
        await Application.silentInstall(session, 'http://maldan.ru:3569/root/test-app.git');

        // Grant privileges
        await Application.updatePrivileges(session, 'http://maldan.ru:3569/root/test-app.git', 'data');

        // Run
        appSession = await Application.run(session, 'http://maldan.ru:3569/root/test-app.git');
    });

    it('create a dir, exists, remove', async function () {
        // Check without session
        await Chai.expect(FileSystem.createDir(null, 'sass')).to.be.rejectedWith(Error, /session/i);

        // Check if file exists
        Chai.expect((await FileSystem.exists(appSession, '/index.html')).status).to.be.eq(true);
        Chai.expect((await FileSystem.exists(appSession, '/sxxsdsdf.html')).status).to.be.eq(false);

        // Write to app folder
        await Chai.expect(FileSystem.createDir(appSession, '/dd')).to.be.rejectedWith(Error, /can't write/i);

        // Write to app data folder
        let dirName = Math.random() + '';
        await FileSystem.createDir(appSession, `/$data/${dirName}`);
        Chai.expect((await FileSystem.exists(appSession, `/$data/${dirName}`)).status).to.be.eq(true);

        // Remove folder
        await FileSystem.remove(appSession, `/$data/${dirName}`);
        Chai.expect((await FileSystem.exists(appSession, `/$data/${dirName}`)).status).to.be.eq(false);

        // Remove from data folder
        await Chai.expect(FileSystem.remove(appSession, '/index.html')).to.be.rejectedWith(Error, /can't write/i);
    });

    it('remove app', async function () {
        // Close app
        Application.close(session, appSession.key);

        // Remove application
        await Application.remove(session, 'http://maldan.ru:3569/root/test-app.git');
    });
});
