import * as Chai from 'chai';
import User from "../src/server/user/User";
import Application from "../src/server/app/Application";
import Session from "../src/server/user/Session";
import AuthenticationError from "../src/server/error/AuthenticationError";

describe('Http', function () {
    Chai.use(require('chai-as-promised'));

    let session;

    it('auth', async function () {
        /*Chai.expect(await User.auth('root', '1234')).to.be.an('string');
        await Chai.expect(User.auth('root', '2281488')).to.be.rejectedWith(AuthenticationError);
        await Chai.expect(User.auth('', '')).to.be.rejectedWith(AuthenticationError);
        await Chai.expect(User.auth(null, null)).to.be.rejectedWith(AuthenticationError);
        await Chai.expect(User.auth(undefined, undefined)).to.be.rejectedWith(AuthenticationError);*/
    });
});
