const RecursiveReaddir = require("recursive-readdir");
const Fs = require('fs');

(async () => {
    let c = [
        ...await RecursiveReaddir('./src/server'),
        //...await RecursiveReaddir('./resource'),
        //...await RecursiveReaddir('./storage/user/root/bin'),
    ].filter(x => {
        // if (!x.match(/draw-studio/)) return false;
        //if (x.match(/vue\.js/) || x.match(/vue\.prod\.js/) || x.match(/\.min\.js/)) return false;
        //if (x.match(/storage/) && x.match(/user/) && x.match(/bin/) && x.match(/lib/)) return false;
        return x.match(/\.(vue|js|scss|ts|html)$/);
    });
    let x = c.map((x) => {
        let ff = Fs.readFileSync(x, 'utf-8');
        ff = ff.replace(/\/\/.*/g, '')
            .replace(/\/\*\*.*?\*\//gsm, '');
        console.log(ff.split('\n').map(x => x.trim()).filter(Boolean).join('\n'));
        return ff.split('\n').map(x => x.trim()).filter(Boolean).length;
    });
    let total = x.reduce((a, b) => a + b, 0);
    console.log(c);
    console.log(x);
    console.log(total);
})();