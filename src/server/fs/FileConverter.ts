import * as Fs from 'fs';
import * as Util from 'util';
import * as Path from 'path';
import * as Tsc from 'typescript';
import * as SASS from 'node-sass';
import * as AutoPrefixer from 'autoprefixer';
import * as PostCSS from 'postcss';
import * as ChildProcess from 'child_process';
import * as Glob from 'glob';
import * as OS from "os";
import TSModuleCompiler from "../util/TSModuleCompiler";

const ReadFile = Util.promisify(Fs.readFile);
const TranspileSCSS = Util.promisify(SASS.render);
const Exec = Util.promisify(ChildProcess.exec);
const GlobSearch = Util.promisify(Glob);

export default class FileConverter {
    static async convert(path: string, params: { [key: string]: {} }): Promise<{ type: string; output: string }> {
        const extension = Path.extname(path);

        if (extension === '.html') {
            return await this.convertHtml(path, params);
        }
        if (extension === '.ts') {
            return await this.convertTypeScript(path, params);
        }
        if (extension === '.scss' || extension === '.sass') {
            return await this.convertSCSS(path, params);
        }
        /*if (extension === '.vue') {
            return await this.convertVue(path, params);
        }*/
        if (extension === '.png' || extension === '.gif' || extension === '.jpeg' || extension === '.jpg') {
            return await this.convertImage(path, params);
        }
        if ((extension === '.mp4' || extension === '.mkv') && (params.frame || params.time || params.offset)) {
            return await this.getVideoThumbnail(path, params);
        }

        return null;
    }

    static async convertHtml(path: string, params: any): Promise<{ type: string; output: string }> {
        let fileContent = await ReadFile(path, 'utf-8');

        fileContent = fileContent.replace(/<!-- APP_DOMAIN -->/g, params.appDomain);
        fileContent = fileContent.replace(/<!-- DOMAIN -->/g, params.domain);

        return {
            type: 'text/html',
            output: fileContent
        };
    }

    static async convertTypeScript(path: string, params: any) {
        const out = await TSModuleCompiler.compileBundle(path, params);

        return {
            type: 'application/javascript',
            output: out
        };
    }

    static async convertSCSS(path: string, params: any) {
        const fileContent = await ReadFile(path, 'utf-8');

        // Transpile
        const result = await TranspileSCSS({
            data: fileContent,
            includePaths: [path.split("/").slice(0, -1).join("/")]
        });

        // Auto prefix
        return {
            type: 'text/css',
            output: PostCSS([AutoPrefixer]).process(result.css).css
        };
    }

    /*static async convertVue(path: string, params: any) {
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
        const result = await TranspileSCSS({
            data: style
        });
        style = PostCSS([AutoPrefixer]).process(result.css).css;

        return {
            type: 'application/json',
            output: {
                template: template,
                script: script,
                style: style
            }
        };
    }*/

    static async convertImage(path: string, params: any): Promise<any> {
        return null;
    }

    static async getVideoThumbnail(path: string, params: any): Promise<any> {
        const tmpFrameName = OS.tmpdir() + '/' + Math.random() + '.jpg';
        let scale = '';
        if (params.size) {
            scale = `-s ${params.size}`;
        }

        if (params.offset) {
            const {stdout} = await Exec(`ffprobe -i "${path}" -show_entries format=duration -v quiet -of csv="p=0"`);
            params.time = (Number.parseFloat(stdout) * params.offset).intToHMS();
        }

        if (params.frame) {
            await Exec(`ffmpeg -i "${path}" -vf "select=eq(n\\,${params.frame})" -frames:v 1 ${scale} "${tmpFrameName}"`);
        } else if (params.time) {
            await Exec(`ffmpeg -ss ${params.time} -i "${path}" -vframes:v 1 ${scale} "${tmpFrameName}"`);
        }

        // Auto prefix
        return {
            type: 'image/jpeg',
            output: await ReadFile(tmpFrameName)
        };
    }
}