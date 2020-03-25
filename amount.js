const RecursiveReaddir = require("recursive-readdir");
const Fs = require('fs');

(async () => {
    let c = [
        ...await RecursiveReaddir('./src'),
        // ...await RecursiveReaddir('./resource'),
        // ...await RecursiveReaddir('./user/root/bin/github.com/maldan'),
    ].filter(x => {
        // if (!x.match(/draw-studio/)) return false;
        //if (x.match(/vue\.js/) || x.match(/vue\.prod\.js/) || x.match(/\.min\.js/)) return false;
        //if (x.match(/storage/) && x.match(/user/) && x.match(/bin/) && x.match(/lib/)) return false;
        return x.match(/\.(ts)$/);
    });
    let x = c.map((x) => {
        let ff = Fs.readFileSync(x, 'utf-8');
        ff = ff.replace(/\/\/.*/g, '')
            .replace(/\/\*\*.*?\*\//gsm, '')
            .replace(/\/\*.*?\*\//gsm, '');
        // console.log(ff.split('\n').map(x => x.trim()).filter(Boolean).join('\n'));
        return ff.split('\n').map(x => x.trim()).filter(Boolean).length;
    });
    let total = x.reduce((a, b) => a + b, 0);

    let final = {};
    for (let i = 0; i < c.length; i++) final[c[i]] = x[i];
    console.log(final);
    console.log(total);
})();