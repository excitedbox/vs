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

    private static async resolveTypeScriptFiles(rootDir:string, path: string, fileList: Set<string> = null) {
        if (!fileList) fileList = new Set<string>();
        if (fileList.has(Path.resolve(rootDir + '/' + path))) return fileList;
        fileList.add(Path.resolve(rootDir + '/' + path));

        let fileContent = await ReadFile(Path.resolve(rootDir + '/' + path), 'utf-8');
        let localFileList: any = new Set<string>();
        fileContent.replace(/\/\/\/ <reference path="(.*?)" \/>/g, (r1, r2) => {
            localFileList.add(r2);
            return '';
        });

        localFileList = Array.from(localFileList);

        for (let i = 0; i < localFileList.length; i++)
            await FileConverter.resolveTypeScriptFiles(rootDir, localFileList[i], fileList);

        return fileList;
    }

    static async convertTypeScript(path: string, params: any) {
        let fileContent = '';
        let fileList = Array.from(await FileConverter.resolveTypeScriptFiles(Path.dirname(path), Path.basename(path)));
        fileList = fileList.reverse();

        for (let i = 0; i < fileList.length; i++) {
            fileContent += await ReadFile(fileList[i], 'utf-8');
            fileContent += '\n\n';
        }

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