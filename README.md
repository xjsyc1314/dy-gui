# 抖音下载器 GUI 版

一个带图形界面的抖音视频/主页/合集下载工具，基于 Electron + Python，内嵌抖音网页，登录后一键下载。

## 本地开发启动

**环境要求：**
- Node.js 20.x（推荐使用 nvm 管理）
- Python 3.10+（推荐使用 conda 环境）
- 已安装 `douyin-downloader` 的依赖和 Playwright 浏览器

**启动步骤：**
```bash
# 1. 切换到 Node 20
nvm use 20.11.1

# 2. 安装前端依赖
npm install

# 3. 准备 Python 下载核心（打包好的 run.exe 或手动构建）
# 将 run.exe 放在 python/run/ 目录下 我已经准备好了，直接使用就行

# 4. 启动应用
npm start
打包
npm run build
```

打包后的便携版 exe 在 dist 目录下。
使用说明

    在右侧浏览器登录抖音

    点击“导入当前登录”获取登录信息

    浏览到想下载的视频/主页/合集，地址栏会自动更新

📂 各类文件占用与清理说明

    PyInstaller 临时文件

        路径：C:\Users\你的用户名\AppData\Local\Temp\_MEIxxxxxx

        说明：这是你打包的 run.exe 运行时必须解压的临时文件。程序正常退出时会自动删除。如果程序崩溃或被强制结束，这些文件夹会残留。

        建议：可以每隔一两周，在系统临时文件夹中搜索并清理以 _MEI 开头的残留文件夹。

    Electron 缓存文件 (GPU/网络缓存)

        路径：C:\Users\你的用户名\AppData\Roaming\抖音下载器\Cache

        说明：Chromium 浏览器的核心缓存，用于加速页面加载和渲染。长时间使用可能积累到上百 MB。

        建议：属于正常浏览器缓存，可以每隔几周手动清理一次，或者如果你后续觉得有必要，可以在应用中加入一个“清理缓存”的功能。

    Electron 用户数据 (登录状态等)

        路径：

            C:\Users\你的用户名\AppData\Roaming\抖音下载器\Local Storage

            C:\Users\你的用户名\AppData\Roaming\抖音下载器\settings.json

        说明：这里存储的是你朋友的抖音登录状态、你为应用设置的主题偏好等。

        建议：千万不要随意删除，否则每次打开都需要重新登录抖音。

    Playwright 浏览器核心 (开发环境)

        路径：C:\Users\你的用户名\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe

        说明：这是开发环境中为原 Python 项目安装的完整 Chromium 浏览器，大约 150MB 左右。

        建议：这个文件在你的电脑上；你朋友收到的打包版 EXE 已经通过 zip 包内置了这个浏览器，不会在他电脑上产生这部分占用。

    Python 环境 (打包版)

        路径：C:\Users\你的用户名\AppData\Roaming\抖音下载器\python

        说明：这是你朋友第一次运行打包好的 EXE 时，程序将 python.zip 自动解压后生成的完整 Python 运行时环境，大约 200MB+。

        建议：此文件夹是程序运行所必需的，绝对不能删除。

    抖音视频下载目录

        路径：默认在你朋友放置 抖音下载器.exe 的同一目录下的 Downloaded 文件夹。

        说明：下载的视频会直接保存在这里，完全不会占用 C 盘空间。

    点击“开始下载”，视频保存在 exe 同目录的 Downloaded 文件夹中

技术栈

    Electron 28

    Python 核心下载器（基于 jiji262/douyin-downloader）

    Playwright 浏览器内核