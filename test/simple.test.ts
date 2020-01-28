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
    });

    it('install app', async function () {
        this.timeout(25000);

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
    });
});
