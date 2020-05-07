export default class Timer {
    public static async delay(ms: number): Promise<void> {
        return new Promise(((resolve: Function) => {
            setTimeout(() => {
                resolve();
            }, ms);
        }));
    }
}