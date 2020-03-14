import * as Chai from 'chai';
import SHA256 from "../src/lib/crypto/SHA256";

describe('Crypto', function () {
    Chai.use(require('chai-as-promised'));

    it('sha256 test', async function () {
        Chai.expect(SHA256.encode("a")).eq('ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb');
        Chai.expect(SHA256.encode("hello world")).eq('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
    });
});
