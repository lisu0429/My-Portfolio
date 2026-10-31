<p align="center">
  <b>简体中文</b> · <a href="./README_EN.md">English</a>
</p>

<!-- README_SYNC: source=working-tree; updated=2026-10-31 -->

<h1 align="center">李彬 · AI 产品经理作品集</h1>

<p align="center">
  一份用手写的个人作品集：<b>React 19 + Vite 8</b>，没有 UI 框架、没有组件库默认皮肤，雾面玻璃 + 测绘制图的视觉全部由 CSS 变量、SVG 与 canvas 撑起来。
</p>

<p align="center">
  <a href="https://github.com/lisu0429/My-Portfolio/stargazers">
    <b>如果这套做法对你有用，点个 Star 收藏，也让更多在找作品集思路的人看到它。</b>
  </a>
</p>

<p align="center">
  <a href="https://github.com/lisu0429/My-Portfolio/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/lisu0429/My-Portfolio?style=flat-square&color=0b3d4d"></a>
  <a href="https://github.com/lisu0429/My-Portfolio/issues"><img alt="Issues" src="https://img.shields.io/github/issues/lisu0429/My-Portfolio?style=flat-square&color=0b3d4d"></a>
  <a href="https://github.com/lisu0429/My-Portfolio/commits/main"><img alt="Last commit" src="https://img.shields.io/github/last-commit/lisu0429/My-Portfolio?style=flat-square&color=0b3d4d"></a>
  <img alt="React 19.3" src="https://img.shields.io/badge/React-19.3-0b3d4d?style=flat-square&logo=react&logoColor=white">
  <img alt="Vite 8.3" src="https://img.shields.io/badge/Vite-8.3-0b3d4d?style=flat-square&logo=vite&logoColor=white">
  <img alt="Node ^20.19 or >=22.12" src="https://img.shields.io/badge/Node-%5E20.19%20%7C%20%3E%3D22.12-0b3d4d?style=flat-square&logo=nodedotjs&logoColor=white">
</p>

![首屏：TechText 渲染的巨名、雾带与骑行视频背景](./docs/images/hero.jpg)

## 这是什么

大部分作品集是简历的网页版：一页自我介绍，几张项目截图，联系方式在最后。这个站点想多做一点——把三个真实项目、能力结构和联系方式压进一条连续的滚动叙事，并且让**每一块视觉都在讲同一件事**：把页面读成一张图幅不断放大的测绘图。

| | |
| --- | --- |
| 面向谁 | 需要一份 AI 产品经理作品集的人，以及想抄这套视觉做法（雾面玻璃 + 等高线）的前端 |
| 解决什么 | 让「技术出身的 AI 产品经理」这件事被看见：不只是会写 PRD，还能把 Demo 和后端原型跑起来 |
| 技术上想证明 | 不引 UI 框架，用 React 19 + 手写 CSS + canvas / WebGL 就能做出有记忆点的版面；动效全部收在 `src/motion/` 一处，好改也好删 |
| 不做什么 | 不是通用作品集模板：没有站内多语言切换、没有 CMS、没有后台，全站文案写死在 `src/data/profile.js` |

## 目录

- [快速开始](#快速开始)
- [页面结构](#页面结构)
- [目录结构](#目录结构)
- [改文案、换素材](#改文案换素材)
- [设计系统](#设计系统)
- [自检脚本](#自检脚本)
- [技术栈](#技术栈)
- [已知限制](#已知限制)
- [致谢](#致谢)
- [许可证](#许可证)

## 快速开始

**方式一：双击 `start.cmd`**（Windows，零门槛）

- 自动检查 Node 环境，首次运行自动 `npm install`
- 端口被占用时先判断是不是本站：是就直接打开浏览器；是别的程序则询问是否结束它
- 启动成功后自动打开浏览器，窗口里可选 `[S]` 停止服务 / `[N]` 保留服务退出
- 随时关掉服务：双击 `stop.cmd`，或在启动窗口按 `S`
- 日志写在 `dev-server.log`

**方式二：命令行**

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # output -> dist/
npm run preview  # serve the production build
```

Node 版本要求 `^20.19.0 || >=22.12.0`（Vite 8 的限制），开发时实际用的是 Node 24。端口固定在 `127.0.0.1:5173`，写在 `vite.config.js` 里。

## 页面结构

五个板块，一条滚动线，右下角常驻导航。所有交互都收在「鼠标能做什么」这一个约束里：hover 提亮、拖拽转动、点击展开。

| 板块 | 主要组件 | 一句话 |
| --- | --- | --- |
| 01 首屏 | `Hero.jsx` · `TechText` · `Lanyard` | 巨名由 canvas 逐字绘制，指针附近的字母会溶解成矢量轮廓；底部压一条雾带 |
| 02 个人经历 | `About.jsx` · `StarBorder` · `NeuronGlobe` | 证件挂带可拖拽摆动、点击翻面；四格数据用星盘统计格；25 个工具聚成一个可分色的球体 |
| 03 精选项目 | `Projects.jsx` · `CardSwap` | 三张卡牌 3D 堆叠，7s 自动轮播，悬停右侧面板即暂停，可拖拽甩出 |
| 04 个人优势 | `Strengths.jsx` · `Survey` | 五张能力卡，卡片上半部压一片等高线地形，hover 时指针附近那圈线会被点亮 |
| 05 联系 | `Contact.jsx` · `CurvedInput` | 一条弧形输入条承载 GitHub 账号，文字是真的排在圆弧上（`<textPath>`） |

### 个人经历

![个人经历：证件挂带、四格星盘统计、剖面式时间线与工具星座](./docs/images/about.jpg)

### 精选项目

![精选项目：CardSwap 卡牌堆与右侧联动详情面板](./docs/images/work.jpg)

### 个人优势

![个人优势：五张能力卡，卡片内压等高线地形](./docs/images/strengths.jpg)

### 联系

![联系页：弧形 GitHub 输入条与雾面玻璃大标题](./docs/images/contact.jpg)

## 目录结构

```text
.
├─ index.html                 # 字体异步加载 + Manrope 800 子集 preload
├─ vite.config.js             # 端口固定 127.0.0.1:5173
├─ start.cmd / stop.cmd       # Windows 一键启动 / 停止
├─ public/
│  ├─ media/                  # hero.mp4、id-card-back.jpg、三张项目图（SVG）
│  ├─ fonts/                  # manrope-latin-800.woff2（13.6KB，自托管）
│  ├─ favicon.svg
│  └─ resume.pdf              # 「下载简历」指向这里
├─ src/
│  ├─ data/profile.js         # 全站文案与项目数据的唯一来源
│  ├─ components/             # 页面板块 + 视觉组件（Survey / StarBorder / NeuronGlobe …）
│  ├─ motion/                 # GSAP + ScrollTrigger，动效的唯一真相源
│  ├─ styles/                 # tokens.css（色板 / 字体 / 尺度）+ base.css
│  └─ assets/headshot.webp    # 证件照（抠底后的透明人像）
├─ scripts/                   # Playwright 截图与交互自检
├─ docs/                      # 设计系统笔记 + 本 README 用的配图
├─ preview/                   # 自检脚本产出的截图（不入库）
└─ _pdfpages/                 # 简历首页 300dpi 渲染图，人工比对用，脚本未引用
```

## 改文案、换素材

**文案**：全站只有一个入口——`src/data/profile.js`。改这一个文件就能更新所有板块。

| 导出的对象 | 管什么 |
| --- | --- |
| `profile` | 姓名、城市、学校、邮箱、电话、GitHub 账号、简历路径 |
| `hero` | 首屏巨名、三个小标签、一句话简介、四个信息位、两个按钮 |
| `stats` | 个人经历的四组数据（数值 + 说明 + 刻度点亮格数） |
| `about` / `timeline` | 个人介绍两段、联系方式、三段经历时间线 |
| `projects` | 三张项目卡：摘要、职责拆解、指标、核心链路、标签、仓库链接 |
| `strengths` | 五张能力卡 |
| `contact` | 联系页标题、说明与渠道 |
| `survey` | 四个板块右上角的图幅读数（TILE / SCALE / CONTOUR / GRID / DATUM） |
| `tools` / `toolGroups` | 工具星座的 25 个工具与 5 个能力簇配色 |

**素材**：

| 素材 | 位置 | 规格 |
| --- | --- | --- |
| 首屏背景视频 | `public/media/hero.mp4` | 1920×1080 / 10s 循环 / 已去音轨（H.264 + faststart，当前 1.4MB） |
| 证件卡背面 | `public/media/id-card-back.jpg` | 1024×1440，点挂带上的卡片翻面时显示 |
| 项目界面图 | `public/media/project-*.svg` | 换成真实截图时用同名 `.png` / `.jpg`，并改 `profile.js` 的 `image` 字段 |
| 证件照 | `src/assets/headshot.webp` | 880×1100 透明底人像，用作挂带卡片正面 |
| 简历 PDF | `public/resume.pdf` | 「下载简历」直接指向它 |
| 首屏字体 | `public/fonts/manrope-latin-800.woff2` | Manrope 800 拉丁子集，CDN 挂了也不影响首屏 |

## 设计系统

四套视觉语言共用一层底：深蓝夜雾 `#070A0E`、雾青 `#A9DEE8`、暖光 `#E8BE96`。细节、参数和踩过的坑都整理进了 **[设计系统与实现笔记](./docs/design-system.md)**，README 只留结论：

- **雾与玻璃**：全站只有一种玻璃材质 `.glass`（4.2% 白底 + `backdrop-filter: blur(22px)`），导航、项目卡、优势卡共用一个类，改一处全站生效。
- **测绘制图**：背景是 React Bits 的 `<Topography />`，内容板块沿用同一套隐喻——等高线分隔条、十字标记、高程刻度、图幅读数条，四个板块是同一张地图上不断放大的四块图幅。
- **工具星座**：React Bits Pro 的付费组件用不了，于是按公开参数表自研了一个等价实现：240 个星点铺球、25 个工具长在球面上、拖拽直接施加旋转角速度、点击沿球面扩散脉冲。

![工具星座：点击球体后 25 个工具名全部展开](./docs/images/globe.jpg)

## 自检脚本

```bash
npm run dev                          # start the dev server first

node scripts/shoot.mjs               # capture every section into preview/, check overflow, reduced-motion, console errors
node scripts/shoot.mjs 1440 1280     # also capture the given viewport widths
node scripts/check-interactions.mjs  # constellation: hover readout, drag spin, click pulse, frame rate, reduced-motion freeze
node scripts/check-contact.mjs       # curved contact bar: does the button / Enter really open GitHub
```

脚本依赖 `playwright-core`，并会按顺序尝试 `CODEX_NODE_MODULES` 环境变量、Codex 内置运行时、本机 `node_modules` 三个位置：

```bash
CODEX_NODE_MODULES=/path/to/node_modules node scripts/shoot.mjs
```

`scripts/` 只服务于素材生成与自检，不参与构建：

```bash
node scripts/gen-hero-video.mjs public/media/hero-loop.webm   # render the hero background loop with Playwright
node scripts/gen-headshot.mjs                                 # re-cut the headshot (source image path is hard-coded at the top of the script)
```

## 技术栈

| 依赖 | 版本 | 在本项目里做什么 |
| --- | --- | --- |
| React / React DOM | 19.3.1 | 页面结构；`StrictMode` 下的双次挂载是几个坑的来源 |
| Vite | 8.3.5 | 开发与构建，无额外插件（只有 `@vitejs/plugin-react`） |
| GSAP | 3.15.0 | 首屏 opening + 滚动进场 + 媒体视差 |
| three.js | 0.187.0 | 只给证件挂带 `<Lanyard />` 用 |
| 手写 CSS | — | CSS Modules + `tokens.css` 变量；没有 Tailwind、没有 UI 库 |

构建产物 `dist/` 与依赖 `node_modules/` 都不入库。

## 已知限制

- **以 PC 展示为主**。断点覆盖 1400 / 1280 / 1200 / 1100 / 900 / 760，窄屏能看，但没有做触屏专项：项目卡拖拽、工具球拖拽、证件挂带摆动都更依赖精确指针。
- **装饰层依赖 WebGL 与 Canvas**（极光、等高线背景、工具星座、星盘、首屏巨名）。关掉硬件加速或浏览器不支持时，这些层不会绘制，正文仍然可读。
- **字体分两半**：首屏名字用自托管子集，其余拉丁与中文仍走 Google Fonts。外网不通时不影响首屏渲染，只是字形回退。
- **自检脚本默认指向本机 Codex 运行时路径**，换机器需要设置 `CODEX_NODE_MODULES`，或在本机装一份 `playwright-core`。
- **没有做 SSR 与自动化部署**：纯静态站点，`npm run build` 之后把 `dist/` 丢到任意静态托管即可，仓库里没有 CI。
- **构建产物没有拆包**：`npm run build` 输出主包 493KB、three 分包 591KB（gzip 后 170KB / 152KB），Vite 会对超过 500KB 的 chunk 报警告；要优化得按板块改动态 import。

## 致谢

视觉组件有一部分来自开源项目 [React Bits](https://reactbits.dev/)（`Aurora` / `Topography` / `StarBorder` / `Lanyard` / `CardSwap` / `TechText` / `CurvedInput`），这些组件与素材仍受它们各自的许可约束；星盘统计格与工具星座是按公开参数自行实现的等价物。动效依赖 [GSAP](https://gsap.com/)，3D 挂带依赖 [three.js](https://threejs.org/)。

## 许可证

这个仓库目前**没有 `LICENSE` 文件**：源码公开可读，但并没有授权任何人复制、修改或再分发其中的代码与素材。如果你想复用某一段实现，欢迎先开 [Issue](https://github.com/lisu0429/My-Portfolio/issues) 说一声，我会按情况给出明确答复，而不是留一个默认 MIT 的模糊地带。第三方组件与字体请遵循各自的许可。

---

如果这个站点给了你一点思路——不管是雾面玻璃的叠法，还是把作品集做成一张测绘图——点个 Star 收着；发现问题或想聊 AI 产品，直接开 [Issue](https://github.com/lisu0429/My-Portfolio/issues) 就行。

<p align="center">
  <a href="./README_EN.md">English version</a>
</p>
