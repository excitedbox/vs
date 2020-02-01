import * as Fs from 'fs';
import * as Util from 'util';
import * as Path from 'path';
import * as Tsc from 'typescript';
import * as SASS from 'node-sass';
import * as AutoPrefixer from 'autoprefixer';
import * as PostCSS from 'postcss';
import * as ChildProcess from 'child_process';
import * as Os from 'os';
import * as Glob from 'glob';

const ReadFile = Util.promisify(Fs.readFile);
const TranspileSCSS = Util.promisify(SASS.render);
const Exec = Util.promisify(ChildProcess.exec);
const GlobSearch = Util.promisify(Glob);

export default class FileConverter {
    static async convert(path: string, params: any) {
        let extension = Path.extname(path);
        if (extension === '.ts') return await this.convertTypeScript(path, params);
        if (extension === '.scss' || extension === '.sass') return await this.convertSCSS(path, params);
        return false;
    }

    static async convertTypeScript(path: string, params: any) {
        let fileContent = await ReadFile(path, 'utf-8');

        // Remove nodejs specific code
        fileContent = fileContent.replace(/\/\/ #ifdef nodejs.*?\/\/ #endif/gsm, '');

        let targetType = Tsc.ScriptTarget.ES2016;
        let sourceMap = false;

        if (params.target === 'es5') targetType = Tsc.ScriptTarget.ES5;
        if (params.hasOwnProperty('source-map')) sourceMap = true;

        // Compile ts to js
        let tmpResult = Tsc.transpileModule(fileContent, {
            reportDiagnostics: true,
            compilerOptions: {
                removeComments: true,
                target: targetType,
                inlineSourceMap: sourceMap
            }
        });

        return {
            type: 'application/javascript',
            output: tmpResult.outputText
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
}