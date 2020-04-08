export default class FunctionHelper {
    static getFunctionParameterNames(fn: Function): RegExpMatchArray {
        const fnStr = fn.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
        const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
            .match(/([^\s,]+)/g);
        if (result === null) {
            return [];
        }
        return result;
    }

    static async callFunctionWithArgumentNames(fn: Function,
                                               args: {} = {}): Promise<unknown> {
        const argNames = FunctionHelper.getFunctionParameterNames(fn);
        const finalArray = [];

        for (const name in args) {
            if (!args.hasOwnProperty(name)) {
                continue;
            }
            const index = argNames.indexOf(name);
            if (index === -1) {
                continue;
            }

            finalArray[index] = args[name];
        }

        return await fn.apply(null, finalArray);
    }
}
