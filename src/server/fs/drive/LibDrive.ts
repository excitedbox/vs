import * as Fs from 'fs';
import * as Util from 'util';
import * as Path from 'path';
import {JSDOM} from 'jsdom';
import IDrive from "./IDrive";
import FileConverter from "../FileConverter";
import Axios from "axios";
import FileSystem from "../FileSystem";

const ReadFile = Util.promisify(Fs.readFile);
const Exists = Util.promisify(Fs.exists);
const WriteFile = Util.promisify(Fs.writeFile);

export default class LibDrive implements IDrive {
    public readonly path: string;
    public readonly args: any;
    public contentType: string = "text/javascript";

    constructor(path: string, args: any = {}) {
        this.path = path;
        this.args = args;
    }

    async readFile() {
        let finalPath = Path.resolve('./src/lib/' + this.path);
        if (await Exists(finalPath)) {
            if (this.args.hasOwnProperty('convert')) {
                let convertedFile = await FileConverter.convert(finalPath, this.args);
                // If converted
                if (convertedFile) {
                    this.contentType = convertedFile.type;
                    return convertedFile.output;
                }
            }
            return await ReadFile(finalPath);
        } else {
            // Remove any unsafe chars
            let libName = this.path.replace('./', '').replace(/\//g, '');
            libName = FileSystem.safePath(libName);
            let pureName = libName.split('@')[0];

            // Return from cache
            if (!this.args.hasOwnProperty('no-cache') && await Exists(`./bin/lib/${libName}`))
                return await ReadFile(`./bin/lib/${libName}`);

            // Go to https://unpkg.com and try to download lib
            // Try first step
            try {
                let libData = (await Axios.get(`https://unpkg.com/${libName}/dist/${pureName}.min.js`)).data;
                await WriteFile(Path.resolve(`./bin/lib/${libName}`), libData);
                return libData;
            } catch {
            }

            // Try second step
            try {
                let libData = (await Axios.get(`https://unpkg.com/${libName}/dist/${pureName}.js`)).data;
                await WriteFile(Path.resolve(`./bin/lib/${libName}`), libData);
                return libData;
            } catch {
            }

            // Try third step
            try {
                let libData = (await Axios.get(`https://unpkg.com/${libName}`)).data;
                await WriteFile(Path.resolve(`./bin/lib/${libName}`), libData);
                return libData;
            } catch {
            }

            // Try forth step
            try {
                // Get file list in dist folder
                let libData = (await Axios.get(`https://unpkg.com/browse/${libName}/dist/`)).data;

                // Parse a table from site with file list
                let dom = new JSDOM(libData);
                let files = [...dom.window.document.querySelectorAll('table tr')]
                    .map(x => x.querySelectorAll('td')[1])
                    .filter(Boolean)
                    .map(x => x.textContent);

                // Filter not js files
                files = files.filter(x => x.match(/\.js$/g));

                // Try to filter files without .min otherwise keep old files
                let files2 = files.filter(x => x.match(/\.min/g));
                if (files2.length) files = files2;

                // Sort files by max match with lib name. For example "xxx.js" match with "xxx" 3 times.
                // The "yyy.js" matches with "xxx" 0 times. In other words we need maximum matching file.
                // This will probably our lib we are searching for.
                files = files.sort((a, b) => b.maxCharsMatch(libName) - a.maxCharsMatch(libName));

                libData = (await Axios.get(`https://unpkg.com/${libName}/dist/${files[0]}`)).data;
                await WriteFile(Path.resolve(`./bin/lib/${libName}`), libData);
                return libData;
            } catch {
            }

            throw new Error(`Lib "${libName}" not found!`);
        }
    }

    async createDir() {
        throw new Error('Not implemented!');
    }

    async exists() {
        throw new Error('Not implemented!');
    }

    async info() {
        throw new Error('Not implemented!');
    }

    async list(filter: string = '') {
        throw new Error('Not implemented!');
    }

    async remove() {
        throw new Error('Not implemented!');
    }

    async rename(name: string) {
        throw new Error('Not implemented!');
    }

    search(filter: string) {
        throw new Error('Not implemented!');
    }

    tree(filter: string) {
        throw new Error('Not implemented!');
    }

    async writeFile(data: Buffer | Uint8Array | string) {
        throw new Error('Not implemented!');
    }
}