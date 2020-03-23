import * as Fs from 'fs';
import * as Util from 'util';
import * as MimeTypes from 'mime-types';
import IDrive from "./IDrive";
import * as Rimraf from "rimraf";
import * as Path from "path";
import FileSystem from "../FileSystem";
import FileConverter from "../FileConverter";
import * as Glob from "glob";
import FileInfo from "../FileInfo";

const ReadFile = Util.promisify(Fs.readFile);
const WriteFile = Util.promisify(Fs.writeFile);
const ReadDir = Util.promisify(Fs.readdir);
const RenamePath = Util.promisify(Fs.rename);
const StatFile = Util.promisify(Fs.stat);
const Exists = Util.promisify(Fs.exists);
const MkDir = Util.promisify(Fs.mkdir);
const RemoveFolder = Util.promisify(Rimraf);
const GlobSearch = Util.promisify(Glob);

export default class StdDrive implements IDrive {
    public readonly path: string;
    public readonly args: any;
    public contentType: string = "text/plain";

    constructor(path: string, args: { [key: string]: {} } = {}) {
        this.path = FileSystem.safePath(Path.resolve(__dirname + '/../../../../', path)
            .replace(/\\/g, '/'));
        this.args = args;
    }

    async readFile(): Promise<string | Buffer> {
        if (!await this.exists()) {
            throw new Error(`File "${this.path}" not found!`);
        }

        if (!this.args.hasOwnProperty('keep-original')) {
            const convertedFile = await FileConverter.convert(this.path, this.args);
            if (convertedFile !== null) {
                this.contentType = convertedFile.type;
                return convertedFile.output;
            }
        }

        this.contentType = await MimeTypes.lookup(Path.extname(this.path)) || 'application/octet-stream';
        return await ReadFile(this.path);
    }

    async createDir(): Promise<void> {
        await MkDir(this.path, {recursive: true});
        if (!await this.exists()) {
            throw new Error(`Can't create the directory "${this.path}"`);
        }
    }

    async exists(): Promise<boolean> {
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
                path: (this.args.sourcePath + '/' + x).replace(/\/\//g, '/'),
                isDir: stat.isDirectory() || stat.isSymbolicLink(),
                size: Fs.statSync(this.path + '/' + x)['size'],
                created: Fs.statSync(this.path + '/' + x)['birthtime']
            };
        });

        // Default folder
        if (this.args.sourcePath === '/') {
            list.push({
                name: '$user',
                path: '/$user',
                isDir: true,
                size: 0,
                created: new Date()
            });
        }

        // Filter files
        list = list.filter(x => {
            if (x.isDir) {
                return true;
            }
            return x.name.match(new RegExp(filter));
        });

        list = list.sort((a, b) => +b.isDir - +a.isDir);

        return list;
    }

    async remove() {
        await RemoveFolder(this.path);
    }

    async rename(name: string) {
        if (name.match(/\.{2,}|[\/\\]/g)) {
            throw new Error('Incorrect name');
        }
        if (!await this.exists()) {
            throw new Error(`Source path not found "${this.path}"`);
        }
        const dstPath = this.path.split('/').slice(0, -1).join('/') + '/' + name;
        await RenamePath(this.path, dstPath);
    }

    async search(filter: string): Promise<FileInfo[]> {
        let path = this.path;
        if (path.slice(-1) !== '/') {
            path += '/';
        }

        console.log(path);

        return (await GlobSearch(path + filter)).map((x: string) => {
            const stat = Fs.lstatSync(x);
            return {
                name: Path.basename(x),
                path: (this.args.sourcePath + x.replace(path, '')).replace(/\/\//g, '/'),
                isDir: stat.isDirectory() || stat.isSymbolicLink(),
                size: Fs.statSync(x)['size'],
                created: Fs.statSync(x)['birthtime']
            };
        });
    }

    tree(filter: string) {
        throw new Error('Not implemented!');
    }

    async writeFile(data: Buffer | Uint8Array | string) {
        await WriteFile(this.path, data);
    }
}