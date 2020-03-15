export default class StringHelper {
    static generateRandomPassword(length: number = 8) {
        let out = '';
        for (let i = 0; i < length; i++) {
            let possibility = Math.random();

            if (possibility <= 0.3) out += String.fromCharCode(65 + Math.round(Math.random() * 25));
            else if (possibility <= 0.6) out += String.fromCharCode(97 + Math.round(Math.random() * 25));
            else out += String.fromCharCode(48 + Math.round(Math.random() * 9));
        }

        return out;
    }
}