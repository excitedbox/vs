import * as MD5 from 'md5';

export default class Helper {
    static get randomKey() {
        return MD5(Math.random() + '_' + Math.random()).slice(-8)
            + '-' + MD5(Math.random() + '_' + Math.random()).slice(-8)
            + '-' + MD5(Math.random() + '_' + Math.random()).slice(-8)
            + '-' + MD5(Math.random() + '_' + Math.random()).slice(-8);
    }
}