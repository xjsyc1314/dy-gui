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

    点击“开始下载”，视频保存在 exe 同目录的 Downloaded 文件夹中

技术栈

    Electron 28

    Python 核心下载器（基于 jiji262/douyin-downloader）

    Playwright 浏览器内核