class VdeApplicationApi {
    async run(query: string) {
        let response = await fetch(`/$api?m=Application.run&query=${query}`);
        return await response.json();
    }

    async install(repo: string) {
        let response = await fetch(`/$api?m=Application.install&query=${repo}`);
        return await response.json();
    }

    async pullUpdate(query: string) {
        let response = await fetch(`/$api?m=Application.pullUpdate&query=${query}`);
        return await response.json();
    }

    async commitList(query: string) {
        let response = await fetch(`/$api?m=Application.commitList&query=${query}`);
        return await response.json();
    }

    async find(query: string) {
        let response = await fetch(`/$api?m=Application.find&query=${query}`);
        return await response.json();
    }

    async currentCommit(query: string) {
        let response = await fetch(`/$api?m=Application.currentCommit&query=${query}`);
        return await response.json();
    }

    async list() {
        let response = await fetch(`/$api?m=Application.list`);
        return await response.json();
    }

    async close(key:string) {
        let response = await fetch(`/$api?m=Application.close&key=${key}`);
        return await response.json();
    }
}