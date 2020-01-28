import * as Chai from 'chai';
import User from "../src/server/user/User";
import Application from "../src/server/app/Application";
import Session from "../src/server/user/Session";

describe('Base', function () {
    Chai.use(require('chai-as-promised'));

    let session;

    it('auth', async function () {
        Chai.expect(await User.auth('root', '1234')).to.be.an('string');
        await Chai.expect(User.auth('root', '2281488')).to.be.rejectedWith(Error);
        await Chai.expect(User.auth('', '')).to.be.rejectedWith(Error);
        await Chai.expect(User.auth(null, null)).to.be.rejectedWith(Error);
        await Chai.expect(User.auth(undefined, undefined)).to.be.rejectedWith(Error);
    });

    it('session', async function () {
        let sessionKey = await User.auth('root', '1234');
        let user = await User.getBySession(sessionKey);
        session = new Session(sessionKey, user);

        Chai.expect(user).to.be.an('object');
        Chai.expect(user).to.have.property('id', 1);
        Chai.expect(user).to.have.property('name', 'root');

        Chai.expect(user.homeDir).to.be.eq( './user/root');
        Chai.expect(user.docsDir).to.be.eq( './user/root/docs');

        await Chai.expect(User.getBySession(null)).to.be.rejectedWith(Error, /incorrect/i);
        await Chai.expect(User.getBySession('sasi')).to.be.rejectedWith(Error, /session/i);
    });

    it('install app', async function () {
        this.timeout(60000);

        // Install incorrect
        await Chai.expect(Application.install(null, 'https://github.com/maldan/vde-image-lab.git'), 'Null session').to.be.rejectedWith(Error, /session/i);
        await Chai.expect(Application.install(session, 'https://github.com/maldan/random-shit-228.git'), 'Invalid repo').to.be.rejectedWith(Error, /can't/i);
        await Chai.expect(Application.install(session, 'https://github.com/DavidPackman/aws-polly-s3-nodejs-example.git'), 'Invalid repo')
            .to.be.rejectedWith(Error, /application\.json/i);
        await Chai.expect(Application.install(session, 'github.com/maldan/random-shit-228.git'), 'Invalid repo url').to.be.rejectedWith(Error, /invalid/i);
        await Chai.expect(Application.install(session, ''), 'Null repo').to.be.rejectedWith(Error, /invalid/i);
        await Chai.expect(Application.install(session, 'sdf sdfsd sdf sdf'), 'Invalid repo url').to.be.rejectedWith(Error, /invalid/i);
        await Chai.expect(Application.install(session, 'https://yandex.ru/fuck you'), 'Invalid repo url').to.be.rejectedWith(Error, /can't/i);
        await Chai.expect(Application.install(session, null), 'Null repo').to.be.rejectedWith(Error, /invalid/i);

        // Install correct with session
        await Application.install(session, 'https://github.com/maldan/vde-image-lab.git');
        await Chai.expect(Application.install(session, 'https://github.com/maldan/vde-image-lab.git'))
            .to.be.rejectedWith(Error, /folder already exists/i);

        // Remove application
        await Chai.expect(Application.remove(null, 'https://github.com/maldan/vde-image-lab.git'), 'Null session').to.be.rejectedWith(Error);
        await Chai.expect(Application.remove(session, 'https://github.com/maldan/random-shit-228.git'), 'Invalid repo').to.be.rejectedWith(Error);
        await Chai.expect(Application.remove(session, null), 'Null repo').to.be.rejectedWith(Error);
        await Application.remove(session, 'https://github.com/maldan/vde-image-lab.git');

        // Get list of apps
        await Chai.expect(Application.list(null), 'Null session').to.be.rejectedWith(Error);
        Chai.expect(await Application.list(session)).to.be.an('array');
    });

    it('update app', async function () {
        this.timeout(60000);

        // Pull update
        await Chai.expect(Application.pullUpdate(null, 'https://github.com/maldan/vde-image-lab.git'), 'Null session').to.be.rejectedWith(Error, /session/i);
        await Chai.expect(Application.pullUpdate(session, null), 'Null repo').to.be.rejectedWith(Error, /repo/i);
        await Chai.expect(Application.pullUpdate(session, 'sdass fsdf'), 'Invalid repo').to.be.rejectedWith(Error, /application/i);

        // Install & update correct with session
        await Application.install(session, 'https://github.com/maldan/vde-image-lab.git');
        await Application.pullUpdate(session, 'https://github.com/maldan/vde-image-lab.git');

        // Current commit
        Chai.expect(await Application.currentCommit(session, 'https://github.com/maldan/vde-image-lab.git')).to.be.eq('3277ffc5f16f21151b0396276c9f7af7a3b8646d');

        // Commit list
        let commitList = await Application.commitList(session, 'https://github.com/maldan/vde-image-lab.git');
        Chai.expect(commitList).to.be.an('array');
        Chai.expect(commitList[0]).to.have.property('hash');
        Chai.expect(commitList[0]).to.have.property('author');
        Chai.expect(commitList[0]).to.have.property('date');
        Chai.expect(commitList[0]).to.have.property('comment');
    });

    it('run app', async function () {
        // Run incorrect
        await Chai.expect(Application.run(null, 'https://github.com/maldan/vde-image-lab.git'), 'Null session').to.be.rejectedWith(Error, /session/i);
        await Chai.expect(Application.run(session, null), 'Null repo').to.be.rejectedWith(Error, /repo/i);
        await Chai.expect(Application.run(session, 'f sdf sdf sdd'), 'Invalid repo').to.be.rejectedWith(Error, /application/i);

        // Run correct
        let appSession = await Application.run(session, 'https://github.com/maldan/vde-image-lab.git');
        Chai.expect(appSession).to.be.an('object');
        Chai.expect(appSession).to.have.property('application');

        // Check if saved
        Chai.expect(Application.runningApplications).to.have.property('size', 1);

        // Close app
        Application.close(appSession);

        // Check if closed
        Chai.expect(Application.runningApplications).to.have.property('size', 0);
    });

    it('remove app', async function () {
        // Remove correct
        await Application.remove(session, 'https://github.com/maldan/vde-image-lab.git');
    });
});
