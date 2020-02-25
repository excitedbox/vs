export default class VdeUrlApi {
    async get(path: string) {
        let response = await fetch(`/$remote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path
            })
        });
        return await response.text();
    }
}