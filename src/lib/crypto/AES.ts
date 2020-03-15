import MD5 from "./MD5";
import ByteArray from "../util/ByteArray";

export default class AES {
    private static Sbox = [
        99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171,
        118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164, 114, 192, 183, 253,
        147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154,
        7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41, 227,
        47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239, 170,
        251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245,
        188, 182, 218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61,
        100, 93, 25, 115, 96, 129, 79, 220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224,
        50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109, 141, 213,
        78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37, 46, 28, 166, 180, 198, 232, 221,
        116, 31, 75, 189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29,
        158, 225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161,
        137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22
    ];
    private static Sbox_Inv;
    private static ShiftRowTab = [0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12, 1, 6, 11];
    private static ShiftRowTab_Inv;
    private static xtime;

    private static init() {
        AES.Sbox_Inv = new Array(256);
        for (let i = 0; i < 256; i++)
            AES.Sbox_Inv[AES.Sbox[i]] = i;

        AES.ShiftRowTab_Inv = new Array(16);
        for (let i = 0; i < 16; i++)
            AES.ShiftRowTab_Inv[AES.ShiftRowTab[i]] = i;

        AES.xtime = new Array(256);
        for (let i = 0; i < 128; i++) {
            AES.xtime[i] = i << 1;
            AES.xtime[128 + i] = (i << 1) ^ 0x1b;
        }
    }

    private static expandKey(key) {
        let kl = key.length, ks, Rcon = 1;
        switch (kl) {
            case 16:
                ks = 16 * (10 + 1);
                break;
            case 24:
                ks = 16 * (12 + 1);
                break;
            case 32:
                ks = 16 * (14 + 1);
                break;
            default:
                console.error("AES_ExpandKey: Only key lengths of 16, 24 or 32 bytes allowed!");
        }

        for (let i = kl; i < ks; i += 4) {
            let temp = key.slice(i - 4, i);
            if (i % kl == 0) {
                temp = [AES.Sbox[temp[1]] ^ Rcon, AES.Sbox[temp[2]],
                    AES.Sbox[temp[3]], AES.Sbox[temp[0]]];
                if ((Rcon <<= 1) >= 256)
                    Rcon ^= 0x11b;
            } else if ((kl > 24) && (i % kl == 16))
                temp = [AES.Sbox[temp[0]], AES.Sbox[temp[1]],
                    AES.Sbox[temp[2]], AES.Sbox[temp[3]]];
            for (let j = 0; j < 4; j++)
                key[i + j] = key[i + j - kl] ^ temp[j];
        }
    }

    private static subBytes(state, sbox) {
        for (let i = 0; i < 16; i++)
            state[i] = sbox[state[i]];
    }

    private static addRoundKey(state, rkey) {
        for (let i = 0; i < 16; i++)
            state[i] ^= rkey[i];
    }

    private static shiftRows(state, shifttab) {
        let h = [].concat(state);
        for (let i = 0; i < 16; i++)
            state[i] = h[shifttab[i]];
    }

    private static mixColumns(state) {
        for (let i = 0; i < 16; i += 4) {
            let s0 = state[i], s1 = state[i + 1];
            let s2 = state[i + 2], s3 = state[i + 3];
            let h = s0 ^ s1 ^ s2 ^ s3;
            state[i] ^= h ^ AES.xtime[s0 ^ s1];
            state[i + 1] ^= h ^ AES.xtime[s1 ^ s2];
            state[i + 2] ^= h ^ AES.xtime[s2 ^ s3];
            state[i + 3] ^= h ^ AES.xtime[s3 ^ s0];
        }
    }

    private static mixColumns_Inv(state) {
        for (let i = 0; i < 16; i += 4) {
            let s0 = state[i], s1 = state[i + 1];
            let s2 = state[i + 2], s3 = state[i + 3];
            let h = s0 ^ s1 ^ s2 ^ s3;
            let xh = AES.xtime[h];
            let h1 = AES.xtime[AES.xtime[xh ^ s0 ^ s2]] ^ h;
            let h2 = AES.xtime[AES.xtime[xh ^ s1 ^ s3]] ^ h;
            state[i] ^= h1 ^ AES.xtime[s0 ^ s1];
            state[i + 1] ^= h2 ^ AES.xtime[s1 ^ s2];
            state[i + 2] ^= h1 ^ AES.xtime[s2 ^ s3];
            state[i + 3] ^= h2 ^ AES.xtime[s3 ^ s0];
        }
    }

    private static encryptBlock(block: Array<number>, key: Array<number>) {
        let l = key.length;
        let ii;
        AES.addRoundKey(block, key.slice(0, 16));
        for (let i = 16; i < l - 16; i += 16) {
            AES.subBytes(block, AES.Sbox);
            AES.shiftRows(block, AES.ShiftRowTab);
            AES.mixColumns(block);
            AES.addRoundKey(block, key.slice(i, i + 16));
            ii = i + 16;
        }
        AES.subBytes(block, AES.Sbox);
        AES.shiftRows(block, AES.ShiftRowTab);
        AES.addRoundKey(block, key.slice(ii, l));
    }

    private static decryptBlock(block, key) {
        let l = key.length;
        AES.addRoundKey(block, key.slice(l - 16, l));
        AES.shiftRows(block, AES.ShiftRowTab_Inv);
        AES.subBytes(block, AES.Sbox_Inv);

        for (let i = l - 32; i >= 16; i -= 16) {
            AES.addRoundKey(block, key.slice(i, i + 16));
            AES.mixColumns_Inv(block);
            AES.shiftRows(block, AES.ShiftRowTab_Inv);
            AES.subBytes(block, AES.Sbox_Inv);
        }
        AES.addRoundKey(block, key.slice(0, 16));
    }

    static encrypt(input: string | Uint8Array, key: string): Uint8Array {
        AES.init();

        if (typeof input === "string")
            input = new TextEncoder().encode(input);

        // Put total length at start of block
        let t = new ByteArray(4);
        t.putUInt32(input.length);
        input = input.prepend(t.buffer);

        let hash = MD5.encode(key).match(/.{1,2}/g).map(x => Number.parseInt(x, 16));
        AES.expandKey(hash);

        let blockAmount = Math.ceil(input.length / 16);
        let out = new Uint8Array(blockAmount * 16);

        for (let i = 0; i < blockAmount; i++) {
            let block = new Array(16);
            for (let j = 0; j < 16; j++) block[j] = ~~input[i * 16 + j];

            AES.encryptBlock(block, hash);
            for (let j = 0; j < block.length; j++) out[i * 16 + j] = block[j];
        }

        return out;
    }

    static decrypt(input: Uint8Array, key: string): Uint8Array {
        AES.init();

        let hash = MD5.encode(key).match(/.{1,2}/g).map(x => Number.parseInt(x, 16));
        AES.expandKey(hash);

        let blockAmount = Math.ceil(input.length / 16);
        let out = new Uint8Array(blockAmount * 16);

        for (let i = 0; i < blockAmount; i++) {
            let block = new Array(16);
            for (let j = 0; j < 16; j++) block[j] = ~~input[i * 16 + j];

            AES.decryptBlock(block, hash);
            for (let j = 0; j < block.length; j++) out[i * 16 + j] = block[j];
        }

        // Get total length at start of block
        let t = new ByteArray(4);
        t.put(out.slice(0, 4));
        t.position = 0;
        let l = t.getUInt32();
        out = out.slice(4, 4 + l);

        return out;
    }
}