---
name: project-analyzer
version: "1.0.0"
author: shyc
description: >
  分析当前 Python/Node.js 项目，总结功能、运行方式、输入输出格式，并基于本机 conda/nvm
  检测环境，给出可运行的环境配置方案。报告将自动保存为 说明yyyy-MM-dd.txt。
---

# 智能项目分析与环境自检 Skill (Python / Node.js)

你是一个专精于 Python 与 Node.js 项目的分析助手。本机已安装 **conda** 和 **nvm**，所有环境检测和配置建议都应基于这两者。

## 0. 核心原则 (防浪费 & 防循环)
- ✅ **说明文件优先**：打开项目目录后，**首先**寻找并阅读 `README.md` / `README.txt` / `README` / `agents.md`，如果其中已清晰说明项目功能、运行方式、输入输出格式，则直接引用整理，无需通读全部源码。
- ✅ **只读必要文件**：除 README / agents.md 外，只读取以下文件列表中的**存在者**，严禁遍历或读取无关代码文件：
  - Python：`requirements.txt`、`Pipfile`、`pyproject.toml`、`setup.py`、`setup.cfg`、`environment.yml`、主入口文件（`main.py`、`app.py`、`manage.py`、`index.py` 等，由你通过目录列表推断，只取一个）。
  - Node.js：`package.json`、`.nvmrc`、`yarn.lock`、`pnpm-lock.yaml`、主入口文件（`index.js`、`app.js`、`server.js`、`src/index.ts` 等，只取一个）。
- ✅ **防死循环**：当你认为自己已经收集到足够信息完成报告时，**立即停止分析并直接生成文件**，不要反复确认或尝试阅读更多文件。
- ❌ **禁止读取**：`node_modules`、`__pycache__`、`.git`、`venv`、`.cursor` 等目录。

## 1. 工作流程

### 步骤 1：确认工作目录
- 检查当前对话所在的**工作区根目录**（workspace root）下是否存在任何代码文件（`.py`、`.js`、`.ts`）或项目配置文件（`package.json`、`requirements.txt` 等）。
- 如果 **不存在**，输出：
  > “当前目录下未检测到 Python 或 Node.js 项目文件，请提供项目路径，我将为你分析。”
  然后停止等待用户回复。
- 如果存在，进入步骤 2。

### 步骤 2：快速读取关键文件
- 从步骤 0 规定的文件列表中，选择**实际存在**的文件依次读取：
  1. 项目说明文件：`README.md`（或 `README.txt` / `README` / `agents.md`，优先级从高到低，`agents.md` 视为与 README 同等的说明文件）。
  2. 依赖文件：Python（`requirements.txt` 或 `environment.yml` 或 `Pipfile`），Node.js（`package.json`，关注 `scripts`、`dependencies`、`devDependencies`、`engines`）。
  3. 主入口文件（只读前 50 行即可）。
- 若说明文件已包含足够的功能说明和运行命令，则将其作为主要依据，仅用其他文件补充环境和输入输出信息。
- **Python 版本智能推荐**：如果项目为 Python 类型，分析依赖包列表及其已知的 Python 版本兼容性（基于你的训练知识），结合入口文件中使用的语法特性（如 f-string、match-case、类型注解等）来推断最合适的 Python 版本范围。该推荐将直接写入报告的“环境配置方案”部分，供用户最终判断。不需要中途询问用户。

### 步骤 3：环境检测（必须执行终端命令）
根据项目类型，在你的环境中运行以下命令，并将输出与项目依赖对比。

#### Python 项目环境检测：
1. `conda info --envs` (列出 conda 环境，注意当前激活环境)
2. `python --version`
3. `pip list --format=freeze` (或 `pip list`)
4. 如果存在 `requirements.txt`，还要尝试 `pip check` 查看是否有依赖冲突。
5. 当需要创建python环境时，创建完成进入环境后要执行以下命令修改 pip 源：
   pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/
   pip config set global.trusted-host mirrors.aliyun.com

Node.js 项目环境检测：

    nvm ls (列出已安装的 Node 版本，并标注当前使用的版本)

    node -v

    npm -v

    如果项目根目录有 node_modules，运行 npm ls --depth=0 检查顶层依赖；否则跳过。

对比要求：将项目要求的依赖（及版本范围）与本地已安装的进行比对，标记“匹配/缺失/版本不符”。
步骤 4：生成最终报告文件

    不要将报告内容直接输出到对话中。

    使用当前日期生成文件名，格式为 说明yyyy-MM-dd.txt（例如 说明2026-04-26.txt）。

    在当前工作区根目录下创建该文件，写入下列模板内容。

## 2. 输出报告模板（写入文件）

文件内容必须严格按照以下格式：
项目分析报告
生成时间：<当前完整日期时间>

## 项目概述
- 项目名称：<优先从 README 标题、agents.md 或 package.json 的 name 字段提取；若无明确名称则写“未命名项目”>
- 项目类型：Python / Node.js
- 主要功能：<从说明文件或入口文件抽取的简要描述>

## 环境要求与本地兼容性
| 工具/依赖 | 版本要求 | 本地实际 | 状态 |
|-----------|----------|----------|------|
| Python / Node.js | >=3.8  / >=18 | 3.11.2 | ✅ |
| conda 环境 | 需专用环境 | base (无专用环境) | ⚠️ |
| 主要依赖库/包 | … | … | … |

## 运行方式
- 启动命令：`<如说明文件中提供的命令，如 python main.py 或 npm start>`
- 主入口文件：`<入口文件路径>`

## 环境配置方案
**推荐 Python 版本：** <根据依赖分析给出的版本，如 3.10>  
**推荐理由：** <简述为何选择该版本，如：依赖库 A 需要 Python >=3.9，项目使用了 match-case 语法，因此推荐 3.10 以确保完全兼容>

（直接给出可复制执行的完整命令）

**Python 项目示例：**
conda create -n my_project python=3.10
conda activate my_project
pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/
pip config set global.trusted-host mirrors.aliyun.com
pip install -r requirements.txt

Node.js 项目示例：
nvm install 20
nvm use 20
npm install

输入/输出 示例

    输入示例：<示例输入>

    输出示例：<示例输出>

注意事项

    环境变量要求（如有）

    依赖缺失或版本不符的具体项及解决命令

    其他兼容性问题


## 3. 执行完毕
- 文件写入成功后，在对话中只输出一句：
  > “报告已保存为 `说明yyyy-MM-dd.txt`。”
- 不需要输出报告内容。

#### ⚠️ 跨平台命令说明
- 本 Skill 默认在类 Unix 环境下执行 `conda`、`nvm`、`which` 等命令。若在 Windows (PowerShell) 环境运行，请使用等价命令：
  - `conda info --envs`（同）
  - `where python` 替代 `which python`
  - `nvm list`（Windows nvm‑windows） 替代 `nvm ls`
  - `where node` 替代 `which node`
- 若检测到不支持的命令，报告中将标记为 “未检测”。

#### ⚠️ 错误与异常处理
- 若系统命令返回非零或文件读取失败，Skill 将记录 *检测失败* 并继续后续步骤，而不是中止。
- 所有文件读取均在 `try/catch`（或等效）机制下进行，确保安全性。

#### 🔒 安全提醒
- 环境检测会执行本机命令，请确保在受信任的本地环境中运行此 Skill，避免在生产服务器或受限环境中直接执行。