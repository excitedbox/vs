export default class MD5 {
    private static safeAdd(x, y) {
        let lsw = (x & 0xffff) + (y & 0xffff);
        let msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xffff);
    }

    private static bitRotateLeft(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    private static md5cmn(q, a, b, x, s, t) {
        return MD5.safeAdd(MD5.bitRotateLeft(MD5.safeAdd(MD5.safeAdd(a, q), MD5.safeAdd(x, t)), s), b);
    }

    private static md5ff(a, b, c, d, x, s, t) {
        return MD5.md5cmn((b & c) | (~b & d), a, b, x, s, t);
    }

    private static md5gg(a, b, c, d, x, s, t) {
        return MD5.md5cmn((b & d) | (c & ~d), a, b, x, s, t);
    }

    private static md5hh(a, b, c, d, x, s, t) {
        return MD5.md5cmn(b ^ c ^ d, a, b, x, s, t);
    }

    private static md5ii(a, b, c, d, x, s, t) {
        return MD5.md5cmn(c ^ (b | ~d), a, b, x, s, t);
    }

    private static binlMD5(x, len) {
        x[len >> 5] |= 0x80 << len % 32;
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        let i;
        let olda;
        let oldb;
        let oldc;
        let oldd;
        let a = 1732584193;
        let b = -271733879;
        let c = -1732584194;
        let d = 271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = MD5.md5ff(a, b, c, d, x[i], 7, -680876936);
            d = MD5.md5ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = MD5.md5ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = MD5.md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = MD5.md5ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = MD5.md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = MD5.md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = MD5.md5ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = MD5.md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = MD5.md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = MD5.md5ff(c, d, a, b, x[i + 10], 17, -42063);
            b = MD5.md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = MD5.md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = MD5.md5ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = MD5.md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = MD5.md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

            a = MD5.md5gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = MD5.md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = MD5.md5gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = MD5.md5gg(b, c, d, a, x[i], 20, -373897302);
            a = MD5.md5gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = MD5.md5gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = MD5.md5gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = MD5.md5gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = MD5.md5gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = MD5.md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = MD5.md5gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = MD5.md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = MD5.md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = MD5.md5gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = MD5.md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = MD5.md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = MD5.md5hh(a, b, c, d, x[i + 5], 4, -378558);
            d = MD5.md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = MD5.md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = MD5.md5hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = MD5.md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = MD5.md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = MD5.md5hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = MD5.md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = MD5.md5hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = MD5.md5hh(d, a, b, c, x[i], 11, -358537222);
            c = MD5.md5hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = MD5.md5hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = MD5.md5hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = MD5.md5hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = MD5.md5hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = MD5.md5hh(b, c, d, a, x[i + 2], 23, -995338651);

            a = MD5.md5ii(a, b, c, d, x[i], 6, -198630844);
            d = MD5.md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = MD5.md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = MD5.md5ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = MD5.md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = MD5.md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = MD5.md5ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = MD5.md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = MD5.md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = MD5.md5ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = MD5.md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = MD5.md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = MD5.md5ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = MD5.md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = MD5.md5ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = MD5.md5ii(b, c, d, a, x[i + 9], 21, -343485551);

            a = MD5.safeAdd(a, olda);
            b = MD5.safeAdd(b, oldb);
            c = MD5.safeAdd(c, oldc);
            d = MD5.safeAdd(d, oldd);
        }
        return [a, b, c, d]
    }

    private static binl2rstr(input) {
        let i;
        let output = '';
        let length32 = input.length * 32;
        for (i = 0; i < length32; i += 8)
            output += String.fromCharCode((input[i >> 5] >>> i % 32) & 0xff);
        return output
    }

    private static rstr2binl(input) {
        let i;
        let output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1)
            output[i] = 0;

        let length8 = input.length * 8;
        for (i = 0; i < length8; i += 8)
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << i % 32;

        return output;
    }

    private static rstrMD5(s) {
        return MD5.binl2rstr(MD5.binlMD5(MD5.rstr2binl(s), s.length * 8));
    }

    private static rstr2hex(input) {
        let hexTab = '0123456789abcdef';
        let output = '';
        let x;
        let i;
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
        }
        return output;
    }

    private static str2rstrUTF8(input) {
        return unescape(encodeURIComponent(input));
    }

    static encode(input: string): string {
        return MD5.rstr2hex(MD5.rstrMD5(MD5.str2rstrUTF8(input)));
    }
}
