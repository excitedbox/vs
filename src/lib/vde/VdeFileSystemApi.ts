import FileInfo from "../../server/fs/FileInfo";

export default class VdeFileSystemApi {
    async createDir(path: string) {
        const response = await fetch(`/$api?m=FileSystem.createDir&path=${path}`);
        return await response.json();
    }

    async exists(path: string) {
        const response = await fetch(`/$api?m=FileSystem.exists&path=${path}`);
        return (await response.json()).status;
    }

    async info(path: string) {
        const response = await fetch(`/$api?m=FileSystem.info&path=${path}`);
        return await response.json();
    }

    async list(path: string, filter: string = ''): Promise<FileInfo[]> {
        const response = await fetch(`/$api?m=FileSystem.list&path=${path}&filter=${filter}`);
        return (await response.json()).map((x: FileInfo) => {
            x.created = new Date(x.created);
            return x;
        });
    }

    async readFile(path: string, type: 'json'): Promise<{}>;
    async readFile(path: string, type: 'binary'): Promise<Uint8Array>;
    async readFile(path: string, type: 'text'): Promise<string>;
    async readFile(path: string, type: 'text' | 'json' | 'binary'): Promise<string | Uint8Array | {}> {
        const response = await fetch(`/$api?m=FileSystem.readFile&path=${path}&keep-original`);
        if (response.status !== 200) {
            throw new Error((await response.json()).message);
        }
        if (type === 'json') {
            return await response.json();
        }
        if (type === 'binary') {
            return new Uint8Array(await response.arrayBuffer());
        }
        return await response.text();
    }

    async readBinaryFile(path: string): Promise<Uint8Array> {
        const file = await this.readFile(path, 'binary');
        return file as Uint8Array;
    }

    async remove(path: string) {
        const response = await fetch(`/$api?m=FileSystem.remove&path=${path}`);
        return await response.json();
    }

    async rename(path: string, name: string) {
        const response = await fetch(`/$api?m=FileSystem.rename&path=${path}&name=${name}`);
        return await response.json();
    }

    async search(path: string, filter: string): Promise<FileInfo[]> {
        const response = await fetch(`/$api?m=FileSystem.search&path=${path}&filter=${filter}`);
        return await response.json();
    }

    async tree(path: string, filter: string) {
        const response = await fetch(`/$api?m=FileSystem.tree&path=${path}&filter=${filter}`);
        return await response.json();
    }

    async writeFile(path: string, data: Buffer | Uint8Array | string | Blob) {
        return new Promise<any>(((resolve, reject) => {
            const oReq = new XMLHttpRequest(), formData = new FormData();

            if (typeof data === "object" && !(data instanceof Blob) && !(data instanceof Uint8Array)) {
                data = JSON.stringify(data);
            }
            formData.append("data", new Blob([data]), "content-file");

            oReq.onload = function () {
                if (this.status === 200) {
                    resolve(this.responseText);
                } else {
                    reject(this.responseText);
                }
            };
            oReq.open("post", `/$api?m=FileSystem.writeFile&path=${path}`, true);
            oReq.send(formData);
        }));
    }
}