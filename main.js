const { app, BrowserWindow, ipcMain, session, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const { spawn, execSync } = require('child_process');

// 禁用 Chromium 的密码保存功能，避免弹窗卡死
app.commandLine.appendSwitch('disable-features', 'PasswordSaving,AutofillSaveCardInfo');

let mainWindow;
let downloadProcess = null;
let settingsPath = path.join(app.getPath('userData'), 'settings.json');

function loadSettings() {
    try {
        if (fs.existsSync(settingsPath)) {
            return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        }
    } catch (e) { }
    return {};
}

function saveSettings(settings) {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

function ensurePython() {
    const pythonDir = path.join(app.getPath('userData'), 'python');
    const exePath = path.join(pythonDir, 'run', 'run.exe');
    if (!fs.existsSync(exePath)) {
        const zipPath = path.join(process.resourcesPath, 'python.zip');
        if (fs.existsSync(zipPath)) {
            try {
                execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${pythonDir}' -Force"`, { stdio: 'ignore' });
            } catch (e) {
                console.error('Python 解压失败:', e);
            }
        }
    }
    return exePath;
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webviewTag: true
        }
    });

    mainWindow.setMenuBarVisibility(false);

    // 处理权限请求，禁止密码保存弹窗
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        const allowed = ['media', 'geolocation', 'notifications', 'midiSysex'];
        callback(allowed.includes(permission));
    });

    // 拦截 will-prevent-unload，防止密码保存弹窗阻塞
    mainWindow.webContents.on('will-prevent-unload', (event) => {
        event.preventDefault();
    });

    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (!url.startsWith('http') && !url.startsWith('https')) {
            event.preventDefault();
        }
    });

    mainWindow.webContents.on('did-attach-webview', (event, webContents) => {
        webContents.setWindowOpenHandler(({ url }) => {
            if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                mainWindow.webContents.send('navigate-to-url', url);
            }
            return { action: 'deny' };
        });

        webContents.on('will-navigate', (event, url) => {
            if (!url.startsWith('http') && !url.startsWith('https')) {
                event.preventDefault();
            }
        });
    });

    mainWindow.loadFile('index.html');

    const settings = loadSettings();
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('load-settings', settings);
    });
}

ipcMain.handle('get-default-download-path', () => {
    const exeDir = path.dirname(app.getPath('exe'));
    return path.join(exeDir, 'Downloaded');
});

ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});

ipcMain.on('save-settings', (event, settings) => {
    saveSettings(settings);
});

ipcMain.handle('get-douyin-cookies', async () => {
    try {
        const cookies = await session.fromPartition('persist:douyin_webview').cookies.get({ domain: '.douyin.com' });
        const needed = ['msToken', 'ttwid', 'odin_tt', 'passport_csrf_token', 'sid_guard'];
        const cookieMap = {};
        for (const c of cookies) {
            if (needed.includes(c.name)) {
                cookieMap[c.name] = c.value;
            }
        }
        return { success: true, cookies: cookieMap };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

ipcMain.handle('start-download', async (event, params) => {
    const { url, savePath, threadNum, cookies } = params;

    const tempConfig = {
        cookies: cookies,
        download_path: savePath,
        thread_num: parseInt(threadNum)
    };
    const tempConfigPath = path.join(app.getPath('temp'), 'douyin_temp_config.yml');
    fs.writeFileSync(tempConfigPath, yaml.dump(tempConfig));

    const isProd = app.isPackaged;
    const pythonExe = isProd ? ensurePython() : path.join(__dirname, 'python', 'run', 'run.exe');

    return new Promise((resolve) => {
        const args = [
            '-c', tempConfigPath,
            '-u', url,
            '-p', savePath || './Downloaded',
            '-t', threadNum || '5'
        ];

        const env = {
            ...process.env,
            PYTHONIOENCODING: 'utf-8',
            PYTHONUTF8: '1',
            LANG: 'en_US.UTF-8',
            TERM: 'dumb',
            NO_COLOR: '1',
            RICH_WINDOWS_CONSOLE: 'off',
        };

        downloadProcess = spawn(pythonExe, args, {
            stdio: ['ignore', 'pipe', 'pipe'],
            env: env,
        });

        downloadProcess.stdout.on('data', (data) => {
            mainWindow.webContents.send('download-log', data.toString('utf-8'));
        });
        downloadProcess.stderr.on('data', (data) => {
            mainWindow.webContents.send('download-log', `[错误] ${data.toString('utf-8')}`);
        });
        downloadProcess.on('close', (code) => {
            downloadProcess = null;
            try { fs.unlinkSync(tempConfigPath); } catch (e) {}
            resolve({ success: code === 0, code });
        });
        downloadProcess.on('error', (err) => {
            downloadProcess = null;
            resolve({ success: false, error: err.message });
        });
    });
});

ipcMain.on('stop-download', () => {
    if (downloadProcess) {
        downloadProcess.kill();
        downloadProcess = null;
    }
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });