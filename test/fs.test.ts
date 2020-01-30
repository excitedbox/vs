import * as Chai from 'chai';
import * as Path from 'path';
import User from "../src/server/user/User";
import Application from "../src/server/app/Application";
import Session from "../src/server/user/Session";
import AuthenticationError from "../src/server/error/AuthenticationError";
import FileSystem from "../src/server/fs/FileSystem";

describe('Base', function () {
    Chai.use(require('chai-as-promised'));

    let session:Session;
    let appSession:Session;

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

    it('resolve path', async function () {
        Chai.expect(await FileSystem.resolvePath(appSession, '/', false, 'r')).eq(FileSystem.safePath(Path.resolve(appSession.application.path)));
        Chai.expect(await FileSystem.resolvePath(appSession, '/index.html', false, 'r')).eq(FileSystem.safePath(Path.resolve(appSession.application.path + '/index.html')));
        Chai.expect(await FileSystem.resolvePath(appSession, '/$data', false, 'rw')).eq(FileSystem.safePath(Path.resolve(appSession.application.storage)));
        Chai.expect(await FileSystem.resolvePath(appSession, '/$data/index.html', false, 'rw')).eq(FileSystem.safePath(Path.resolve(appSession.application.storage+ '/index.html')));
        Chai.expect(await FileSystem.resolvePath(appSession, '/$lib', false, 'r')).eq(FileSystem.safePath(Path.resolve('./src/lib')));
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

    it('get file list', async function () {
        // Must contain an index.html file
        let list:Array<any> = await FileSystem.list(appSession, `/`);
        Chai.expect(list.find(x => x.name === 'index.html')).to.be.not.eq(undefined);
        Chai.expect(list.find(x => x.name === 'style.scss')).to.be.not.eq(undefined);

        // Must filter
        list = await FileSystem.list(appSession, `/`, 'style');
        //Chai.expect(list.length).eq(2);
        Chai.expect(list.find(x => x.name === 'style.scss')).to.be.not.eq(undefined);

        // Must filter except folders
        list = await FileSystem.list(appSession, `/`, 'df gdf gdfgdfg');
        //Chai.expect(list.length).eq(1);
        Chai.expect(list.find(x => x.name === '.git')).to.be.not.eq(undefined);
    });

    it('get file info', async function () {
        // Must contain an index.html file
        let info = await FileSystem.info(appSession, `/index.html`);
        Chai.expect(info).to.be.not.eq(undefined);
        Chai.expect(info).to.have.property('size');
    });

    it('read file', async function () {
        // Must contain an index.html file
        let info = await FileSystem.readFile(appSession, `/index.html`);
        Chai.expect(info).to.be.not.eq(undefined);

        await Chai.expect(FileSystem.readFile(appSession, '/indexxxdd.html')).to.be.rejectedWith(Error, /not exists/i);
        await Chai.expect(FileSystem.readFile(appSession, '/.git')).to.be.rejectedWith(Error, /directory/i);
    });

    it('rename file', async function () {
        await Chai.expect(FileSystem.rename(appSession, '/index.html', 'sas.html'))
            .to.be.rejectedWith(Error, /can't write/i);


        // Write to app data folder
        let dirName = Math.random() + '';
        await FileSystem.createDir(appSession, `/$data/${dirName}`);
        Chai.expect((await FileSystem.exists(appSession, `/$data/${dirName}`)).status).to.be.eq(true);

        // Incorrect rename
        await Chai.expect(FileSystem.rename(appSession, `/$data/${dirName}`, '../../'))
            .to.be.rejectedWith(Error, /incorrect/i);

        // Correct rename
        await FileSystem.rename(appSession, `/$data/${dirName}`, 'sas228');
        Chai.expect((await FileSystem.exists(appSession, `/$data/${dirName}`)).status).to.be.eq(false);
        Chai.expect((await FileSystem.exists(appSession, `/$data/sas228`)).status).to.be.eq(true);
        await FileSystem.remove(appSession, `/$data/sas228`);
        Chai.expect((await FileSystem.exists(appSession, `/$data/sas228`)).status).to.be.eq(false);
    });

    it('write file', async function () {
        await Chai.expect(FileSystem.writeFile(appSession, '/index2.html', 'test'))
            .to.be.rejectedWith(Error, /can't write/i);

        await Chai.expect(FileSystem.writeFile(appSession, '/$lib/index2.html', 'test'))
            .to.be.rejectedWith(Error, /can't write/i);

        await Chai.expect(FileSystem.writeFile(appSession, '/$public/index2.html', 'test'))
            .to.be.rejectedWith(Error, /can't write/i);

        await Chai.expect(FileSystem.writeFile(appSession, '/$root/index2.html', 'test'))
            .to.be.rejectedWith(Error, /access/i);

        // Write to app data folder
        let fileName = Math.random() + '.txt';
        await FileSystem.writeFile(appSession, `/$data/${fileName}`, 'sas228');

        let data = await FileSystem.readFile(appSession, `/$data/${fileName}`);
        Chai.expect(data.toString('utf-8')).to.be.eq('sas228');
    });

    it('remove app', async function () {
        // Close app
        Application.close(session, appSession.key);

        // Remove application
        await Application.remove(session, 'http://maldan.ru:3569/root/test-app.git');
    });
});
