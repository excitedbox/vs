import Main from "./src/server/Main";
Main.run();

/*for (let i = 0; i < 2; i++) {
    const fork = require('child_process').fork;
    const spawn = require('child_process').spawn;
    const path = require('path');
    const child = spawn(`ts-node`, [path.resolve('./service/a/test.ts')], {
        stdio: [ 0, 1, 2, 'ipc' ]
    });

    child.on('message', message => {
        console.log('message from child:', message);
    });

    child.on('exit', code => {
        console.log('child oomer (( ' + code);
    });

    child.send(Buffer.from('Sas'));
}*/