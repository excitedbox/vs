import * as Chai from 'chai';
import SHA256 from "../src/lib/crypto/SHA256";
import MD5 from "../src/lib/crypto/MD5";
import AES from "../src/lib/crypto/AES";

import ArrayExtender from "../src/lib/extender/ArrayExtender";

describe('Crypto', function () {
    new ArrayExtender();

    Chai.use(require('chai-as-promised'));

    it('sha256 test', async function () {
        Chai.expect(SHA256.encode("a")).eq('ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb');
        Chai.expect(SHA256.encode("hello world")).eq('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
    });

    it('md5 test', async function () {
        Chai.expect(MD5.encode("a")).eq('0cc175b9c0f1b6a831c399e269772661');
        Chai.expect(MD5.encode("hello world")).eq('5eb63bbbe01eeed093cb22bb8f5acdc3');
        Chai.expect(MD5.encode("")).eq('d41d8cd98f00b204e9800998ecf8427e');
        Chai.expect(MD5.encode("Calculate the amount of padding needed")).eq('004d708e494dd34319b514a7525b81c2');
        Chai.expect(MD5.encode("digestBuffers[1] = digestBuffers[1] + leftRotate(digestBuffers[0] + tempBuffer[0] + consts[i] + chunkBuffers[tempIndex[0]], shifts[i]);")).eq('7de5f26be6cac5d8fdbb0dd45b18186a');
        Chai.expect(MD5.encode("в зашифрованные")).eq('1f6b41025f5218d805305360da2977fb');
        Chai.expect(MD5.encode("в зашифрованные данные добавить несколько байт")).eq('ae41c1f982d7b85789cbfdf94ba46d07');
    });

    it('aes test', async function () {
        ['123', 'Алгоритм AES', 'длиной 128 битов в другой', 'dKD5nP2HM7L776y5'].forEach(key => {
            // Encrypt a simple phrase with simple key
            let enc = AES.encrypt("test", key);
            let dec = AES.decrypt(enc, key);
            Chai.expect(dec.toUTF8()).eq("test");

            // Encrypt utf8 phrase with simple key
            enc = AES.encrypt("Алгоритм AES преобразует блок длиной 128 битов в другой блок той же длины.", key);
            dec = AES.decrypt(enc, key);
            Chai.expect(dec.toUTF8()).eq("Алгоритм AES преобразует блок длиной 128 битов в другой блок той же длины.");

            // Encrypt a longer utf8 phrase with simple key
            enc = AES.encrypt("Алгоритм шифрования получает на вход 128-битный блок данных input и расписание ключей w, которое получается после KeyExpansion. 16-байтый input он записывает в виде матрицы s размера 4×Nb, которая называется состоянием AES, и затем Nr раз применяет к этой матрице 4 преобразования. В конце он записывает матрицу в виде массива и подаёт его на выход — это зашифрованный блок. Каждое из четырёх преобразований очень простое.", key);
            dec = AES.decrypt(enc, key);
            Chai.expect(dec.toUTF8()).eq("Алгоритм шифрования получает на вход 128-битный блок данных input и расписание ключей w, которое получается после KeyExpansion. 16-байтый input он записывает в виде матрицы s размера 4×Nb, которая называется состоянием AES, и затем Nr раз применяет к этой матрице 4 преобразования. В конце он записывает матрицу в виде массива и подаёт его на выход — это зашифрованный блок. Каждое из четырёх преобразований очень простое.");
        });
    });
});
