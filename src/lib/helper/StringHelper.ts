import MD5 from "../crypto/MD5";

export default class StringHelper {
  static generateRandomPassword(length: number = 8): string {
    let out = '';
    for (let i = 0; i < length; i++) {
      const possibility = Math.random();

      if (possibility <= 0.3) {
        out += String.fromCharCode(65 + Math.round(Math.random() * 25));
      } else if (possibility <= 0.6) {
        out += String.fromCharCode(97 + Math.round(Math.random() * 25));
      } else {
        out += String.fromCharCode(48 + Math.round(Math.random() * 9));
      }
    }

    return out;
  }

  static generateRandomKey(sectionAmount: number = 4,
                           sectionSize: number = 4): string {
    const out = [];

    for (let i = 0; i < sectionAmount; i++) {
      out.push(
          MD5.encode(Math.random() + '_' + Math.random()).slice(-sectionSize));
    }

    return out.join('-');
  }
}
