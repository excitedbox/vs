import * as Fs from 'fs';
import * as Util from 'util';
import * as Path from 'path';
import Session from "../../user/Session";
import IDrive from "./IDrive";
import * as Rimraf from "rimraf";
import FileConverter from "../FileConverter";
import Axios from "axios";

const ReadFile = Util.promisify(Fs.readFile);
const ReadDir = Util.promisify(Fs.readdir);
const StatFile = Util.promisify(Fs.stat);
const Exists = Util.promisify(Fs.exists);
const MkDir = Util.promisify(Fs.mkdir);
const WriteFile = Util.promisify(Fs.writeFile);

export default class LibDrive implements IDrive {
    public readonly path: string;
    public readonly args: any;
    public contentType: string = "text/javascript";

    constructor(path: string, args:any = {}) {
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
            let libName = this.path.replace('./', '').replace(/\//g, '');



            let libs = (await Axios.get(`https://api.cdnjs.com/libraries?search=${libName}&fields=name,filename,version`)).data.results;
            if (!libs[0]) throw new Error(`Lib "${libName}" not found!`);
            let libPath = libs[0].name + '/' + libs[0].version + '/' + libs[0].filename;
            let libData = (await Axios.get(libs[0].latest)).data;
            await MkDir(Path.resolve('./bin/lib/' + libs[0].name + '/' + libs[0].version), {recursive: true});
            await WriteFile(Path.resolve('./bin/lib/' + libPath), libData);
            return libData;
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