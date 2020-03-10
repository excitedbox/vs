export default class VdeUrlApi {
    async get(url: string, type: string = 'text') {
        const formData = new FormData();
        formData.append('url', url);
        let response = await fetch(`/$remote`, {
            method: 'POST',
            body: formData
        });
        if (type === 'blob' || type === 'binary') return await response.blob();
        return await response.text();
    }
}