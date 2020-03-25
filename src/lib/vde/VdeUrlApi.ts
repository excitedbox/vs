export default class VdeUrlApi {
    async get(url: string, type: 'blob' | 'binary'): Promise<Blob>;
    async get(url: string, type: 'text' | 'blob' | 'binary'): Promise<string | Blob> {
        const formData = new FormData();
        formData.append('url', url);
        const response = await fetch(`/$remote`, {
            method: 'POST',
            body: formData
        });
        if (type === 'blob' || type === 'binary') {
            return await response.blob();
        }
        return await response.text();
    }
}