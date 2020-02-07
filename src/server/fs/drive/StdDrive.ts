import * as Fs from 'fs';
import * as Util from 'util';
import * as MimeTypes from 'mime-types';
import IDrive from "./IDrive";
import * as Rimraf from "rimraf";
import * as Path from "path";
import FileSystem from "../FileSystem";
import FileConverter from "../FileConverter";

const ReadFile = Util.promisify(Fs.readFile);
const WriteFile = Util.promisify(Fs.writeFile);
const ReadDir = Util.promisify(Fs.readdir);
const RenamePath = Util.promisify(Fs.rename);
const StatFile = Util.promisify(Fs.stat);
const Exists = Util.promisify(Fs.exists);
const MkDir = Util.promisify(Fs.mkdir);
const RemoveFolder = Util.promisify(Rimraf);

export default class StdDrive implements IDrive {
    public readonly path: string;
    public readonly args: any;
    public contentType: string = "text/plain";

    constructor(path: string, args:any = {}) {
        this.path = FileSystem.safePath(Path.resolve(__dirname + '/../../../../', path)
            .replace(/\\/g, '/'));
        this.args = args;
    }

    async readFile() {
        if (!this.exists()) throw new Error(`File "${this.path}" not found!`);

        // Try to convert by default
        if (!this.args.hasOwnProperty('keep-original')) {
            let convertedFile = await FileConverter.convert(this.path, this.args);
            // If converted
            if (convertedFile) {
                this.contentType = convertedFile.type;
                return convertedFile.output;
            }
        }

        this.contentType = MimeTypes.lookup(Path.extname(this.path)) || 'application/octet-stream';
        return await ReadFile(this.path);
    }

    async createDir() {
        await MkDir(this.path, {recursive: true});
        if (!await this.exists()) throw new Error(`Can't create the directory "${this.path}"`);
    }

    async exists() {
        return await Exists(this.path);
    }

    async info() {
        return await StatFile(this.path);
    }

    async list(filter: string = '') {
        let list: any = await ReadDir(this.path);

        // Transform data
        list = list.map(x => {
            const stat = Fs.lstatSync(this.path + '/' + x);
            return {
                name: x,
                isDir: stat.isDirectory(),
                size: Fs.statSync(this.path + '/' + x)['size'],
                created: Fs.statSync(this.path + '/' + x)['birthtime']
            }
        });

        // Default folder
        if (this.args.sourcePath === '/') {
            list.push({
                name: '$user',
                isDir: true,
                size: 0,
                created: new Date()
            });
        }

        // Filter files
        list = list.filter(x => {
            if (x.isDir) return true;
            return x.name.match(new RegExp(filter));
        });

        list = list.sort((a, b) => +b.isDir - +a.isDir);

        return list;
    }

    async remove() {
        await RemoveFolder(this.path);
    }

    async rename(name: string) {
        if (name.match(/\.{2,}|[\/\\]/g)) throw new Error('Incorrect name');
        if (!await this.exists()) throw new Error(`Source path not found "${this.path}"`);
        let dstPath = this.path.split('/').slice(0, -1).join('/') + '/' + name;
        await RenamePath(this.path, dstPath);
    }

    search(filter: string) {
        throw new Error('Not implemented!');
    }

    tree(filter: string) {
        throw new Error('Not implemented!');
    }

    async writeFile(data: Buffer | Uint8Array | string) {
        await WriteFile(this.path, data);
    }
}