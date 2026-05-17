const savePathInput = document.getElementById('savePath');
const threadNumSelect = document.getElementById('threadNum');
const getCookieBtn = document.getElementById('getCookieBtn');
const downloadBtn = document.getElementById('downloadBtn');
const stopBtn = document.getElementById('stopBtn');
const logArea = document.getElementById('logArea');
const cookieStatus = document.getElementById('cookieStatus');
const urlBar = document.getElementById('urlBar');
const goBtn = document.getElementById('goBtn');
const webview = document.getElementById('douyinWebview');
const togglePanelBtn = document.getElementById('togglePanelBtn');
const expandPanelBtn = document.getElementById('expandPanelBtn');
const leftPanel = document.getElementById('leftPanel');
const expandHint = document.getElementById('expandHint');
const clearLogBtn = document.getElementById('clearLogBtn');
// const copyLogBtn = document.getElementById('copyLogBtn');
const browseBtn = document.getElementById('browseBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');

let currentCookies = null;

// 初始化默认下载路径
(async () => {
    const defaultPath = await window.electronAPI.getDefaultDownloadPath();
    savePathInput.value = defaultPath;
})();

function setUrl(url) {
    if (url && url !== urlBar.value) urlBar.value = url;
}

goBtn.addEventListener('click', () => {
    let url = urlBar.value.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    webview.loadURL(url);
});
urlBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') goBtn.click();
});

window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'url-changed' && e.data.url) {
        setUrl(e.data.url);
    }
});

window.electronAPI.onNavigateToUrl((url) => setUrl(url));

browseBtn.addEventListener('click', async () => {
    const folder = await window.electronAPI.selectFolder();
    if (folder) {
        savePathInput.value = folder;
        window.electronAPI.saveSettings({ downloadPath: folder });
    }
});

getCookieBtn.addEventListener('click', async () => {
    const result = await window.electronAPI.getDouyinCookies();
    if (result.success && result.cookies && Object.keys(result.cookies).length >= 3) {
        currentCookies = result.cookies;
        cookieStatus.innerHTML = `✅ Cookie 已获取 (${new Date().toLocaleTimeString()})`;
        log('✅ 成功获取当前抖音登录态');
    } else {
        cookieStatus.innerHTML = '❌ 获取失败，请在右侧先登录抖音';
        log('❌ 获取 Cookie 失败，请确保右侧页面已登录');
    }
});

downloadBtn.addEventListener('click', async () => {
    const url = urlBar.value.trim();
    if (!url.includes('douyin.com')) return log('⚠️ 当前页面不是抖音链接');
    if (!currentCookies) return log('⚠️ 请先点击“导入当前登录”获取 Cookie');
    downloadBtn.disabled = true; stopBtn.disabled = false;
    log(`🚀 开始下载: ${url}`);
    const result = await window.electronAPI.startDownload({
        url,
        savePath: savePathInput.value,
        threadNum: threadNumSelect.value,
        cookies: currentCookies
    });
    if (result.success) log('✅ 下载任务完成');
    else log(`❌ 下载异常: ${result.error || result.code}`);
    downloadBtn.disabled = false; stopBtn.disabled = true;
});

stopBtn.addEventListener('click', () => {
    window.electronAPI.stopDownload();
    log('⏹ 已停止下载');
    downloadBtn.disabled = false; stopBtn.disabled = true;
});

clearLogBtn.addEventListener('click', () => {
    logArea.innerHTML = '';
    log('🗑️ 日志已清除');
});

// copyLogBtn.addEventListener('click', () => {
//     const text = logArea.innerText;
//     navigator.clipboard.writeText(text).then(() => {
//         log('📋 日志已复制到剪贴板');
//     }).catch(() => {
//         log('❌ 复制失败，请手动选择复制');
//     });
// });

togglePanelBtn.addEventListener('click', () => {
    leftPanel.classList.add('collapsed');
    expandHint.style.display = 'block';
});
expandPanelBtn.addEventListener('click', () => {
    leftPanel.classList.remove('collapsed');
    expandHint.style.display = 'none';
});

// 主题切换
themeToggleBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    themeToggleBtn.textContent = isLight ? '🌙' : '☀️';
    window.electronAPI.saveSettings({ theme: isLight ? 'light' : 'dark' });
});

// 加载设置（路径和主题）
window.electronAPI.onLoadSettings((settings) => {
    if (settings.downloadPath) {
        savePathInput.value = settings.downloadPath;
    }
    if (settings.theme === 'light') {
        document.body.classList.add('light-mode');
        themeToggleBtn.textContent = '🌙';
    } else {
        document.body.classList.remove('light-mode');
        themeToggleBtn.textContent = '☀️';
    }
});

window.electronAPI.onDownloadLog((message) => log(message));

function log(msg) {
    const entry = document.createElement('div');
    entry.textContent = msg;
    logArea.appendChild(entry);
    logArea.scrollTop = logArea.scrollHeight;
}