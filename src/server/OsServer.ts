export default class OsServer {
    static run(port: number) {
        const Express = require('express');
        const RestApp = Express();

        // Set public folder
        RestApp.use(Express.static('./bin/public'));

        RestApp.listen(port, function () {
            console.log(`OS Server starts at :${port}`);
        });
    }
}