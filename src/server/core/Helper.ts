import * as MD5 from 'md5';

export default class Helper {
    static get randomKey() {
        return MD5(Math.random() + '_' + Math.random()).slice(-4)
            + '-' + MD5(Math.random() + '_' + Math.random()).slice(-4)
            + '-' + MD5(Math.random() + '_' + Math.random()).slice(-4)
            + '-' + MD5(Math.random() + '_' + Math.random()).slice(-4);
    }

    static getFunctionParameterNames(fn: Function) {
        let fnStr = fn.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
        let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
        if (result === null) return [];
        return result;
    }

    static async callFunctionWithArgumentNames(fn: Function, args: any = {}) {
        let argNames = Helper.getFunctionParameterNames(fn);
        let finalArray = [];

        for (let name in args) {
            if (!args.hasOwnProperty(name)) continue;
            let index = argNames.indexOf(name);
            if (index === -1) continue;

            finalArray[index] = args[name];
        }

        return await fn.apply(null, finalArray);
    }
}