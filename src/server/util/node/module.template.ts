let __MODULE__NAME__ = (() => {
    let module_map = [];
    let __require = (rootDir) => {
        return function (path) {
            let finalPath;

            // Probably node module
            if (path.match(/^[a-z]+$/)) {
                finalPath = path;
            } else {
                let p1 = rootDir.split('/');
                p1.pop();
                let p2 = path.split('/');
                for (let i = 0; i < p2.length; i++) {
                    if (p2[i] === '.') {
                        p2.shift();
                        i--;
                    }
                    if (p2[i] === '..') {
                        p1.pop();
                        p2.shift();
                        i--;
                    }
                }

                finalPath = p1.concat(p2).join('/');
            }

            if (!program[finalPath]) throw new Error('Module "' + path + '" not found!');
            if (module_map.includes(finalPath)) return program[finalPath].__cache;
            module_map.push(finalPath);
            return program[finalPath].execute();
        }
    };

    let program = {
        /** __MODULE__BUNDLE__ */
    };

    return program['__MODULE__PATH'].execute().default;
})();