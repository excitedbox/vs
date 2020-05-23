const { app, BrowserWindow } = require('electron');
const Fs = require('fs');
const axios = require('axios');

async function createWindow () {
    console.log(process.argv[2] + 'application.json');
    const params = (await axios.get(process.argv[2] + 'application.json')).data;

    // Создаем окно браузера.
    const win = new BrowserWindow({
        title: params.title,
        width: params.window.width ?params.window.width + 12 :800,
        height: params.window.height ?params.window.height + 32 :600,
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: true
        },
        // transparent: true,
        // frame: false
    });
    // console.log(params.size);
    // and load the index.html of the app.
    win.loadURL(process.argv[2]);
    win.removeMenu();
    // Отображаем средства разработчика.
    // win.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Некоторые API могут использоваться только после возникновения этого события.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // Для приложений и строки меню в macOS является обычным делом оставаться
    // активными до тех пор, пока пользователь не выйдет окончательно используя Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // На MacOS обычно пересоздают окно в приложении,
    // после того, как на иконку в доке нажали и других открытых окон нету.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});