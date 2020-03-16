import * as Tsc from "typescript";
import * as Path from "path";
import * as Fs from 'fs';
import * as Util from 'util';
import builtinModules from "./node/builtin.modules";

const ReadFile = Util.promisify(Fs.readFile);

export default class TSModuleCompiler {
    static async compileBundle(path: string, params: any) {
        let modules = {};

        function createCompilerHost(): Tsc.CompilerHost {
            return {
                getSourceFile,
                getDefaultLibFileName: () => "lib.d.ts",
                writeFile: (fileName, content) => {
                    // fileName = Path.relative(Path.dirname(path), fileName).replace(/\.js$/, '').replace(/\\/g, '/');
                    fileName = fileName.replace(/\.js$/, '').replace(/\\/g, '/');
                    modules[fileName] = content;
                },
                getCurrentDirectory: () => Tsc.sys.getCurrentDirectory(),
                getDirectories: path => Tsc.sys.getDirectories(path),
                getCanonicalFileName: fileName =>
                    Tsc.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
                getNewLine: () => Tsc.sys.newLine,
                useCaseSensitiveFileNames: () => Tsc.sys.useCaseSensitiveFileNames,
                fileExists,
                readFile,
                // resolveModuleNames
            };

            function fileExists(fileName: string): boolean {
                return Tsc.sys.fileExists(fileName);
            }

            function readFile(fileName: string): string | undefined {
                return Tsc.sys.readFile(fileName);
            }

            function getSourceFile(fileName: string, languageVersion: Tsc.ScriptTarget, onError?: (message: string) => void) {
                const sourceText = Tsc.sys.readFile(fileName);
                return sourceText !== undefined
                    ? Tsc.createSourceFile(fileName, sourceText, languageVersion)
                    : undefined;
            }

            /*function resolveModuleNames(
                moduleNames: string[],
                containingFile: string
            ): Tsc.ResolvedModule[] {
                const resolvedModules: Tsc.ResolvedModule[] = [];
                for (const moduleName of moduleNames) {
                    let result = Tsc.resolveModuleName(moduleName, containingFile, options, {
                        fileExists,
                        readFile
                    });
                    if (result.resolvedModule) {
                        // console.log(result.resolvedModule);
                        resolvedModules.push(result.resolvedModule);
                    } else {
                        // check fallback locations, for simplicity assume that module at location
                        // should be represented by '.d.ts' file
                        /!*for (const location of moduleSearchLocations) {
                            const modulePath = Path.join(location, moduleName + ".d.ts");
                            if (fileExists(modulePath)) {
                                resolvedModules.push({ resolvedFileName: modulePath });
                            }
                        }*!/
                    }
                }
                return resolvedModules;
            }*/
        }

        // Generated outputs
        const host = createCompilerHost();
        const options: Tsc.CompilerOptions = {
            module: Tsc.ModuleKind.CommonJS,
            target: Tsc.ScriptTarget.ES2016
        };
        let program = Tsc.createProgram([
            path
        ], options, host);

        let emitResult = program.emit();

        let bundle = '';

        // If include builtin node modules
        if (params.hasOwnProperty('node_modules')) {
            // Get list of modules
            let bmList = builtinModules.list();

            for (let name in bmList) {
                let functionList = '';

                // Add functions from module
                for (let fn in bmList[name]) {
                    if (!bmList[name].hasOwnProperty(fn)) continue;
                    functionList += `exports.${fn} = ${bmList[name][fn]};\n`;
                }

                bundle += `
                    '${name}': {
                        __cache: {},
                        execute() {
                            let exports = this.__cache;
                            let require = __require('${name}');
                            
                            ${functionList}
                            
                            return exports;
                        }
                    },
                `;
            }
        }

        for (let m in modules) {
            bundle += `
                '${m}': {
                    __cache: {},
                    execute() {
                        let exports = this.__cache;
                        let require = __require('${m}');
                        ${modules[m]}
                        return exports;
                    }
                },
            `;
        }

        // Load template and change
        let out = await ReadFile('./src/server/util/node/module.template.ts', 'utf-8');
        out = out
            .replace('__MODULE__NAME__', Path.basename(path).replace('.ts', ''))
            .replace('// __MODULE__BUNDLE__', bundle)
            .replace('__MODULE__PATH', path.replace(/\\/g, '/').replace(/\.ts$/, ''));

        return out;
    }
}