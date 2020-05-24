const {app, BrowserWindow} = require('electron');
const Fs = require('fs');
const Axios = require('axios');
const Os = require('os');

async function createWindow() {
    // Params
    const params = (await Axios.get(process.argv[2] + 'application.json')).data;

    // Download icon
    let iconPath = '';
    try {
        const icon = (await Axios.get(process.argv[2] + 'icon.png', {responseType: 'arraybuffer'})).data;
        iconPath = Os.tmpdir() + '/' + Math.random();
        Fs.writeFileSync(iconPath, icon);
    }
    catch (e) {

    }

    // Создаем окно браузера
    const win = new BrowserWindow(Object.assign({
        title: params.title,
        width: params.window ? params.window.width + 12 : 800,
        height: params.window ? params.window.height + 32 : 600,
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: true
        }
    }, iconPath ?{ icon: iconPath } :{}));

    win.loadURL(process.argv[2]);
    win.removeMenu();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});