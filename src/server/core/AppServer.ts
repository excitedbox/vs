export default class AppServer {
    static run(port: number) {
        const Express = require('express');
        const RestApp = Express();

        RestApp.listen(port, function () {
            console.log(`App Server starts at :${port}`);
        });
    }
}