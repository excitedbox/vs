export default class VdeApplicationApi {
    async run(query: string) {
        let response = await fetch(`/$api?m=Application.run&query=${query}`);
        if (response.status !== 200) throw new Error(await response.text());
        return await response.json();
    }

    async install(repo: string) {
        const response = await fetch(`/$api?m=Application.install&repo=${repo}`);
        if (response.status !== 200) {
            throw new Error(await response.text());
        }
        return await response.json();
    }

    async remove(query: string): Promise<{}> {
        const response = await fetch(`/$api?m=Application.remove&query=${query}`);
        if (response.status !== 200) {
            throw new Error(await response.text());
        }
        return await response.json();
    }

    async pullUpdate(query: string) {
        let response = await fetch(`/$api?m=Application.pullUpdate&query=${query}`);
        if (response.status !== 200) throw new Error(await response.text());
        return await response.json();
    }

    async commitList(query: string) {
        let response = await fetch(`/$api?m=Application.commitList&query=${query}`);
        if (response.status !== 200) throw new Error(await response.text());
        return await response.json();
    }

    async find(query: string) {
        let response = await fetch(`/$api?m=Application.find&query=${query}`);
        if (response.status !== 200) throw new Error(await response.text());
        return await response.json();
    }

    async currentCommit(query: string) {
        let response = await fetch(`/$api?m=Application.currentCommit&query=${query}`);
        if (response.status !== 200) throw new Error(await response.text());
        return await response.json();
    }

    async list(): Promise<Array<{
        title: string, name: string, path: string,
        storage: string, repo: string, isStatic: boolean,
        id: null, access: Array<string>
    }>> {
        let response = await fetch(`/$api?m=Application.list`);
        if (response.status !== 200) throw new Error(await response.text());
        let list = await response.json();
        list = list.map(x => {
            x.access = x.access || [];
            return x;
        });
        return list;
    }

    async updatePrivileges(query: string, access: Array<string>) {
        let response = await fetch(`/$api?m=Application.updatePrivileges&query=${query}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({access})
        });
        if (response.status !== 200) throw new Error(await response.text());
        return await response.json();
    }

    async close(key: string) {
        let response = await fetch(`/$api?m=Application.close&key=${key}`);
        if (response.status !== 200) throw new Error(await response.text());
        return await response.json();
    }
}