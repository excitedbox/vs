import * as Fs from 'fs';
import * as Util from 'util';
import * as Path from 'path';
import * as Tsc from 'typescript';
import * as SASS from 'node-sass';
import * as AutoPrefixer from 'autoprefixer';
import * as PostCSS from 'postcss';
import * as ChildProcess from 'child_process';
import * as Glob from 'glob';

const ReadFile = Util.promisify(Fs.readFile);
const TranspileSCSS = Util.promisify(SASS.render);
const Exec = Util.promisify(ChildProcess.exec);
const GlobSearch = Util.promisify(Glob);

export default class FileConverter {
    static async convert(path: string, params: any) {
        let extension = Path.extname(path);
        if (extension === '.html') return await this.convertHtml(path, params);
        if (extension === '.ts') return await this.convertTypeScript(path, params);
        if (extension === '.scss' || extension === '.sass') return await this.convertSCSS(path, params);
        if (extension === '.vue') return await this.convertVue(path, params);
        if (extension === '.png' || extension === '.gif' || extension === '.jpeg' || extension === '.jpg')
            return await this.convertImage(path, params);
        return false;
    }

    static async convertHtml(path: string, params: any) {
        let fileContent = await ReadFile(path, 'utf-8');

        fileContent = fileContent.replace(/<!-- APP_DOMAIN -->/g, params.appDomain);
        fileContent = fileContent.replace(/<!-- DOMAIN -->/g, params.domain);

        return {
            type: 'text/html',
            output: fileContent
        };
    }

    static async convertTypeScript(path: string, params: any) {
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
                resolveModuleNames
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

            function resolveModuleNames(
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
                        /*for (const location of moduleSearchLocations) {
                            const modulePath = Path.join(location, moduleName + ".d.ts");
                            if (fileExists(modulePath)) {
                                resolvedModules.push({ resolvedFileName: modulePath });
                            }
                        }*/
                    }
                }
                return resolvedModules;
            }

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

        let out = `
        let ${Path.basename(path).replace('.ts', '')} = (() => {
        let module_map = [];
        let __require = (rootDir) => {
            return function(path) {
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
                
                let finalPath = p1.concat(p2).join('/');
                if (!program[finalPath]) throw new Error('Module "' + path + '" not found!');
                if (module_map.includes(finalPath)) return program[finalPath].__cache;
                module_map.push(finalPath);
                return program[finalPath].execute();
            }
        }
        let program = {`;
        for (let m in modules) {
            out += `
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
        out += `}\n`;
        out += `return program['${path.replace(/\\/g, '/').replace(/\.ts$/, '')}'].execute().default;\n`;
        out += `})()\n`;

        return {
            type: 'application/javascript',
            output: out
        }
    }

    static async convertSCSS(path: string, params: any) {
        let fileContent = await ReadFile(path, 'utf-8');

        // Transpile
        let result = await TranspileSCSS({
            data: fileContent,
            includePaths: [path.split("/").slice(0, -1).join("/")]
        });

        // Auto prefix
        return {
            type: 'text/css',
            output: PostCSS([AutoPrefixer]).process(result.css).css
        };
    }

    static async convertVue(path: string, params: any) {
        let fileContent = await ReadFile(path, 'utf-8');

        let template = '';
        let script = '';
        let style = '';

        fileContent = fileContent.replace(/<template>(.*?)<\/template>/gs, (r1, r2) => {
            template = r2;
            return '';
        });

        fileContent = fileContent.replace(/<script.*?>(.*?)<\/script>/gsu, (r1, r2) => {
            script = r2.replace('export default {', '(() => { return {') + '})()';
            return '';
        });

        fileContent = fileContent.replace(/<style.*?>(.*?)<\/style>/gsu, (r1, r2) => {
            style = r2;
            return '';
        });

        // Transpile
        let result = await TranspileSCSS({
            data: style
        });
        style = PostCSS([AutoPrefixer]).process(result.css).css;

        /*let template = fileContent.substring(
            fileContent.lastIndexOf("<template>") + 10,
            fileContent.lastIndexOf("</template>")
        );

        let script = fileContent.substring(
            fileContent.lastIndexOf("<script>") + 8,
            fileContent.lastIndexOf("</script>")
        ).replace('export default {', '(() => { return {') + '})()';*/

        return {
            type: 'application/json',
            output: {
                template: template,
                script: script,
                style: style
            }
        };
    }

    static async convertImage(path: string, params: any): Promise<any> {
        return false;
    }
}