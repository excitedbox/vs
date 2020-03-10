export default class SHA256 {
    static encode(input: Uint8Array) {
        let rightRotate = (value, amount) => (value >>> amount) | (value << (32 - amount));
        let mathPow = Math.pow;
        let maxWord = mathPow(2, 32);
        let lengthProperty = 'length';
        let i, j;
        let result = '';
        let words = [];
        let asciiBitLength = input[lengthProperty] * 8;
        let hash = [];
        let k = [];
        let primeCounter = 0;
        let isComposite = {};

        for (let candidate = 2; primeCounter < 64; candidate++) {
            if (!isComposite[candidate]) {
                for (i = 0; i < 313; i += candidate)
                    isComposite[i] = candidate;
                hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
                k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
            }
        }

        /*let padding = 1;
        while (input[lengthProperty] % 64 - 56) padding++; // += '\x00' // More zero padding
        let copy = new Uint8Array(input, 0, input.length + padding);
        copy[input.length] = 0x80; // Append Ƈ' bit (plus zero padding)
        console.log(2);*/

        for (i = 0; i < input[lengthProperty]; i++) {
            j = input[i];
            if (j >> 8) return;
            words[i >> 2] |= j << ((3 - i) % 4) * 8;
        }
        words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
        words[words[lengthProperty]] = (asciiBitLength);

        // process each chunk
        for (j = 0; j < words[lengthProperty];) {
            let w = words.slice(j, j += 16);
            let oldHash = hash;
            hash = hash.slice(0, 8);

            for (i = 0; i < 64; i++) {
                let i2 = i + j;
                let w15 = w[i - 15], w2 = w[i - 2];

                let a = hash[0], e = hash[4];
                let temp1 = hash[7]
                    + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
                    + ((e & hash[5]) ^ ((~e) & hash[6]))
                    + k[i]
                    + (w[i] = (i < 16) ? w[i] : (
                            w[i - 16]
                            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
                            + w[i - 7]
                            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
                        ) | 0
                    );

                let temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

                hash = [(temp1 + temp2) | 0].concat(hash);
                hash[4] = (hash[4] + temp1) | 0;
            }

            for (i = 0; i < 8; i++)
                hash[i] = (hash[i] + oldHash[i]) | 0;
        }

        for (i = 0; i < 8; i++) {
            for (j = 3; j + 1; j--) {
                let b = (hash[i] >> (j * 8)) & 255;
                result += ((b < 16) ? 0 : '') + b.toString(16);
            }
        }

        return result;
    }
}